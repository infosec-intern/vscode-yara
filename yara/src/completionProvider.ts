"use strict";

import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import * as vscode from 'vscode';


type Module = Array<vscode.CompletionItem>;
type ModuleSchema = Map<string,Module>;

/*
    Parse a string in a TextDocument and determine if an associated module has been imported for Code Completion
*/
function canCompleteTerm(schema: ModuleSchema, requestedModule: string, doc: vscode.TextDocument): boolean {
    if (vscode.workspace.getConfiguration("yara").get("require_imports")) {
        // should match every line starting with 'import "<module>"'
        const moduleNames: Array<string> = Array.from(schema.keys());
        const importRegexp = RegExp(`^import "(${moduleNames.join('|')})"`);
        const imported_modules: Array<string> = doc.getText().split("\n").filter((line: string) => {
            return importRegexp.test(line);
        }).map<string>((line: string) => { return line.split("\"")[1]; });
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
    // else if (schemaType === 'field') {
    //     kind = vscode.CompletionItemKind.Field;    // 4
    // }
    else if (schemaType === 'array') {
        kind = vscode.CompletionItemKind.Unit;      // 10
    }
    else if (schemaType === 'dictionary') {
        kind = vscode.CompletionItemKind.Struct;    // 21
    }
    else {
        // console.log(`got schema I don't recognize: ${JSON.stringify(schemaType)}`);
    }
    return kind;
}

/*
    Generate a CompletionItem object out of a given label and kind
    ... and potentially transform it based on its kind
*/
// function makeCompletionItem(schemaLabel: string, schemaKind: string): vscode.CompletionItem|undefined {
//     let item: vscode.CompletionItem|undefined = undefined;
//     const itemKind: vscode.CompletionItemKind = getCompletionItemKind(schemaKind);
//     if (itemKind === vscode.CompletionItemKind.Method) {
//         item = new vscode.CompletionItem(`${schemaLabel}`, itemKind);
//         item.insertText = new vscode.SnippetString(`${schemaLabel}($1)`);
//     }
//     else if (itemKind === vscode.CompletionItemKind.Struct) {
//         item = new vscode.CompletionItem(`${schemaLabel}`, itemKind);
//         item.insertText = new vscode.SnippetString(`${schemaLabel}["$\{1:key}"]`);
//     }
//     else {
//         item = new vscode.CompletionItem(schemaLabel, itemKind);
//     }
//     return item;
// }

/*
    Convert a directory of module JSON schemas to Module objects
*/
function parseSchema(schemaPath: string): ModuleSchema {
    const matches: Array<string> = glob.sync('*.json', {cwd: schemaPath});
    const schema: ModuleSchema = new Map<string,Module>();
    matches.forEach((match: string) => {
        const moduleName: string = path.parse(match).name;
        const fullPath: string = path.join(schemaPath, match);
        const content: Record<string,unknown> = JSON.parse(fs.readFileSync(fullPath).toString());
        const yaraModule: Module = [];
        Object.keys(content).forEach((attribute: string) => {
            let item: vscode.CompletionItem|undefined = undefined;
            const itemKind: string|unknown = content[attribute];
            if (itemKind instanceof Array) {
                // module arrays (e.g. pe.sections[], dotnet.guids[])
                // possibly includes sub-fields on each array entry (e.g. pe.sections[].name)
                itemKind.forEach((property: Map<string,string>) => {
                    Object.keys(property).forEach((subField: string) => {
                        item = new vscode.CompletionItem(`${moduleName}.${attribute}[].${subField}`, getCompletionItemKind(property[subField]));
                        yaraModule.push(item);
                    });
                });
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
                    // item = makeCompletionItem(`${moduleName}.${attribute}.${subField}`, itemKind[subField]);
                    yaraModule.push(item);
                });
            }
        });
        schema.set(moduleName, yaraModule);
    });
    return schema;
}

export class YaraCompletionItemProvider implements vscode.CompletionItemProvider {
    // path to the directory containing module data
    schemaPath: string = path.join(__dirname, '..', '..', '..', 'yara', 'src', 'modules');
    schema: ModuleSchema = parseSchema(this.schemaPath);
    wordDefinition = new RegExp('[a-zA-Z0-9._]+');

    public provideCompletionItems(doc: vscode.TextDocument, pos: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionList> {
        return new Promise((resolve, reject) => {
            token.onCancellationRequested(resolve);
            try {
                const items: vscode.CompletionList = new vscode.CompletionList([]);
                const fullTerm: string = doc.getText(doc.getWordRangeAtPosition(pos, this.wordDefinition));
                const terms: Array<string> = fullTerm.split(".");
                // first check if the first symbol in the term has been imported, if needed
                if (canCompleteTerm(this.schema, terms[0], doc)) {
                    const desiredModule: Module = this.schema.get(terms[0]);
                    if (desiredModule !== undefined) {
                        items.items = desiredModule.filter((entry: vscode.CompletionItem) => {
                            return entry.label.startsWith(fullTerm);
                        }).map<vscode.CompletionItem>((entry: vscode.CompletionItem) => {
                            // remove any leading characters that overlap with the term already in the document
                            // ... but keep full module path as a detail item and the text to filter by
                            entry.detail = entry.label;
                            entry.filterText = entry.label;
                            console.log(terms);
                            const insertText = entry.label.replace(fullTerm, '');
                            if (entry.kind === vscode.CompletionItemKind.Method) {
                                entry.label = `${entry.label}()`;
                                entry.insertText = new vscode.SnippetString(`${insertText}($1)`);
                            }
                            else if (entry.kind === vscode.CompletionItemKind.Struct) {
                                entry.insertText = new vscode.SnippetString(`${insertText}["$\{1:key}"]`);
                            }
                            return entry;
                        });
                        resolve(items);
                    }
                }
                reject();
            } catch (error) {
                console.log(`YaraCompletionItemProvider: ${error}`);
                reject();
            }
        });
    }

    public resolveCompletionItem(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
        return new Promise((resolve) => {
            token.onCancellationRequested(resolve);
            console.log(item);
            resolve(item);
        });
    }
}
