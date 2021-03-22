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
        // TODO: Fix this crap
        // const moduleNames: Array<string> = schema.forEach((m: Module, k: string) => { moduleNames.push(k); });
        const moduleNames: Array<string> = ["cuckoo", "dotnet", "elf", "hash", "magic", "math", "pe", "time"];
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
    else if (schemaType === 'struct') {
        kind = vscode.CompletionItemKind.Struct;    // 21
    }
    else if (schemaType === 'array') {
        kind = vscode.CompletionItemKind.Unit;      // 10
    }
    else {
        console.log(`got schema I don't recognize: ${JSON.stringify(schemaType)}`);
    }
    return kind;
}

/*
    Generate a CompletionItem object out of a given label and kind
    ... and potentially transform it based on its kind
*/
function makeCompletionItem(schemaLabel: string, schemaKind: string): vscode.CompletionItem|undefined {
    let item: vscode.CompletionItem|undefined = undefined;
    const itemKind: vscode.CompletionItemKind = getCompletionItemKind(schemaKind);
    if (itemKind === vscode.CompletionItemKind.Method) {
        item = new vscode.CompletionItem(`${schemaLabel}()`, itemKind);
    }
    else {
        item = new vscode.CompletionItem(schemaLabel, itemKind);
    }
    return item;
}

/*
    Convert a directory of module JSON schemas to Module objects
*/
function parseSchema(schemaPath: string): ModuleSchema {
    const matches: Array<string> = glob.sync("*.json", {cwd: schemaPath});
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
                item = makeCompletionItem(`${moduleName}.${attribute}[]`, 'array');
                yaraModule.push(item);
                itemKind.forEach((property: Map<string,string>) => {
                    Object.keys(property).forEach((subField: string) => {
                        item = makeCompletionItem(`${moduleName}.${attribute}[].${subField}`, property[subField]);
                        yaraModule.push(item);
                    });
                });
            }
            else if (typeof itemKind === 'string') {
                // simple module fields (e.g. pe.number_of_sections, hash.md5)
                item = makeCompletionItem(`${moduleName}.${attribute}`, itemKind);
                yaraModule.push(item);
            }
            else if (typeof itemKind === 'object') {
                // module fields with their own sub-fields (e.g. cuckoo.network.http_request)
                item = makeCompletionItem(`${moduleName}.${attribute}`, 'struct');
                yaraModule.push(item);
                Object.keys(itemKind).forEach((subField: string) => {
                    item = makeCompletionItem(`${moduleName}.${attribute}.${subField}`, itemKind[subField]);
                    yaraModule.push(item);
                });
            }
        });
        schema[moduleName] = yaraModule;
    });
    console.log(schema);
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
                    console.log(this.schema);
                    const desiredModule: Module = this.schema.get(terms[0]);
                    console.log(JSON.stringify(desiredModule));
                    // const fields: (string | vscode.CompletionItemKind)[][] = modules.get(doc, pos, config.get("require_imports", false));
                    // let items: vscode.CompletionItem[] = Array<vscode.CompletionItem>();
                    // items = fields.map<vscode.CompletionItem>((field: Array<string|vscode.CompletionItemKind>) => {
                    //     return new vscode.CompletionItem(field[0] as string, field[1] as vscode.CompletionItemKind);
                    // });
                }
                resolve(items);
            } catch (error) {
                console.log(`YaraCompletionItemProvider: ${error}`);
                reject();
            }
        });
    }
/*
    public resolveCompletionItem(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
        return new Promise((resolve, reject) => {
            console.log(`resolving ${JSON.stringify(item)}`);
            resolve(item);
        });
    }
*/
}
