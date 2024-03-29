'use strict';

import vscode = require('vscode');
import { debug } from './configuration';
import { log } from './helpers';

type Module = Array<vscode.CompletionItem>;
type ModuleSchema = Map<string,Module>;

/*
    Parse a string in a TextDocument and determine if an associated module has been imported for Code Completion
*/
function canCompleteTerm(schema: ModuleSchema, requestedModule: string, doc: vscode.TextDocument): boolean {
    if (vscode.workspace.getConfiguration('yara').get('requireImports')) {
        // should match every line starting with 'import "<module>"'
        const moduleNames: Array<string> = Array.from(schema.keys());
        const importRegexp = RegExp(`^import "(${moduleNames.join('|')})"`);
        const imported_modules: Array<string> = doc.getText().split("\n").filter((line: string) => {
            return importRegexp.test(line);
        }).map<string>((line: string) => { return line.split("\"")[1]; });
        if (debug) { log(`YaraCompletionItemProvider: Identified imported modules as: ${imported_modules.join(', ')}`); }
        // user requires modules to be imported before code completion can take effect
        return imported_modules.some((module: string) => { return module == requestedModule; });
    }
    return true;
}

function getCompletionItemKind(schemaType: string): vscode.CompletionItemKind {
    let kind: vscode.CompletionItemKind = vscode.CompletionItemKind.Class;  // 6
    if (schemaType === 'enum') {
        kind = vscode.CompletionItemKind.Enum;      // 12
    }
    else if (schemaType === 'method') {
        kind = vscode.CompletionItemKind.Method;    // 1
    }
    else if (schemaType === 'property') {
        kind = vscode.CompletionItemKind.Property;  // 9
    }
    else if (schemaType === 'array') {
        kind = vscode.CompletionItemKind.Unit;      // 10
    }
    else if (schemaType === 'dictionary') {
        kind = vscode.CompletionItemKind.Struct;    // 21
    }
    else if (typeof schemaType !== 'object') {
        // Ignoring arbitrary JSON objects, if we get to this point someone has specified a type
        // ... that we don't have knowledge of - it's probably a typo
        log(`YaraCompletionItemProvider: Recieved unrecognizable module schema: ${JSON.stringify(schemaType)}`);
    }
    return kind;
}

/*
    Convert a single module JSON schema to a flattened list of CompletionItems
*/
function parseModule(moduleUri: vscode.Uri, moduleName: string): Module {
    const yaraModule: Module = [];
    vscode.workspace.fs.readFile(moduleUri).then((data: Uint8Array) => {
        try {
            const content: Record<string,unknown> = JSON.parse(String.fromCharCode.apply(null, data));
            Object.keys(content).forEach((attribute: string) => {
                let item: vscode.CompletionItem|undefined = undefined;
                const itemKind: string|unknown = content[attribute];
                if (itemKind instanceof Array) {
                    // module arrays (e.g. pe.sections[], dotnet.guids[])
                    if (itemKind.length === 0) {
                        item = new vscode.CompletionItem(`${moduleName}.${attribute}`, getCompletionItemKind('array'));
                        yaraModule.push(item);
                    }
                    else {
                        // possibly includes sub-fields on each array entry (e.g. pe.sections[].name)
                        itemKind.forEach((property: Map<string,string>) => {
                            Object.keys(property).forEach((subField: string) => {
                                item = new vscode.CompletionItem(`${moduleName}.${attribute}[].${subField}`, getCompletionItemKind(property[subField]));
                                yaraModule.push(item);
                            });
                        });
                    }
                }
                else if (typeof itemKind === 'string') {
                    // simple module fields (e.g. pe.number_of_sections, hash.md5)
                    item = new vscode.CompletionItem(`${moduleName}.${attribute}`, getCompletionItemKind(itemKind));
                    yaraModule.push(item);
                }
                else if (typeof itemKind === 'object') {
                    // module fields with their own sub-fields (e.g. cuckoo.network.http_request)
                    Object.keys(itemKind).forEach((subField: string) => {
                        item = new vscode.CompletionItem(`${moduleName}.${attribute}.${subField}`, getCompletionItemKind(itemKind[subField]));
                        yaraModule.push(item);
                    });
                }
            });
        } catch (err) {
            log(`Could not parse invalid JSON from ${moduleUri.fsPath}: ${err}`);
        }
    });
    return yaraModule;
}

/*
    Convert a directory of module JSON schemas to a map of Modules to flattened lists of CompletionItems
*/
function parseSchema(moduleDir: vscode.Uri): ModuleSchema {
    const schema: ModuleSchema = new Map<string,Module>();
    vscode.workspace.fs.readDirectory(moduleDir).then((entries: [string, vscode.FileType][]) => {
        entries.forEach(([entryName, entryType]: [string, vscode.FileType]) => {
            if (entryType == vscode.FileType.File && entryName.endsWith('.json')) {
                const moduleUri: vscode.Uri = vscode.Uri.joinPath(moduleDir, entryName);
                const moduleName: string = entryName.split('.').shift();
                const module: Module = parseModule(moduleUri, moduleName);
                schema.set(moduleName, module);
            }
        });
    });
    return schema;
}

export class YaraCompletionItemProvider implements vscode.CompletionItemProvider {
    schema: ModuleSchema;
    wordDefinition = new RegExp('[a-zA-Z0-9._]+');

    constructor(extensionUri: vscode.Uri) {
        const moduleDir = vscode.Uri.joinPath(extensionUri, 'yara', 'modules');
        this.schema = parseSchema(moduleDir);
    }

    public provideCompletionItems(doc: vscode.TextDocument, pos: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionList> {
        return new Promise((resolve, reject) => {
            token.onCancellationRequested(() => {
                if (debug) { log('YaraCompletionItemProvider: Task cancelled!'); }
                resolve(undefined);
            });
            try {
                const items: vscode.CompletionList = new vscode.CompletionList([]);
                const fullTerm: string = doc.getText(doc.getWordRangeAtPosition(pos, this.wordDefinition));
                if (debug) { log(`YaraCompletionItemProvider: Term to complete as a module entry: ${fullTerm}`); }
                const terms: Array<string> = fullTerm.split('.');
                const prefix = `${terms.slice(0, terms.length-1).join('.')}.`;
                // first check if the first symbol in the term has been imported, if needed
                if (canCompleteTerm(this.schema, terms[0], doc)) {
                    const desiredModule: Module = this.schema.get(terms[0]);
                    if (desiredModule !== undefined) {
                        items.items = desiredModule.filter((entry: vscode.CompletionItem) => {
                            return entry.label.startsWith(fullTerm);
                        }).map<vscode.CompletionItem>((entry: vscode.CompletionItem) => {
                            // remove any leading characters that overlap with the term already in the document
                            // ... but keep full module path as a detail item and the text to filter by
                            entry.filterText = entry.label;
                            const insertText = entry.label.replace(prefix, '');
                            if (entry.kind === getCompletionItemKind('method')) {
                                entry.detail = `${entry.label}()`;
                                entry.insertText = new vscode.SnippetString(`${insertText}($1)`);
                            }
                            else if (entry.kind === getCompletionItemKind('array')) {
                                entry.detail = `${entry.label}[index]`;
                                entry.insertText = new vscode.SnippetString(`${insertText}[$\{1:index}]`);
                            }
                            else if (entry.kind === getCompletionItemKind('dictionary')) {
                                entry.detail = `${entry.label}["key"]`
                                entry.insertText = new vscode.SnippetString(`${insertText}["$\{1:key}"]`);
                            }
                            else if (entry.label.includes('[].')) {
                                // sub-properties of array items
                                entry.detail = entry.label.replace('[]', '[index]');
                                entry.insertText = new vscode.SnippetString(insertText.replace('[]', '[${1:index}]'));
                            }
                            else {
                                entry.insertText = insertText;
                            }
                            return entry;
                        });
                        if (debug) { log(`YaraCompletionItemProvider: Resolving ${items.items.length} completion items`); }
                        resolve(items);
                    }
                }
                reject();
            } catch (error) {
                log(`YaraCompletionItemProvider error: ${error}`);
                reject();
            }
        });
    }

    public resolveCompletionItem(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
        return new Promise((resolve) => {
            token.onCancellationRequested(() => {
                if (debug) { log('YaraCompletionItemProvider: Resolution task cancelled!'); }
                resolve(undefined);
            });
            // TODO: Add documentation - VT Filetypes would be a great place to start
            resolve(item);
        });
    }
}
