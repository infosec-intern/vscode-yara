"use strict";

import * as path from "path";
import * as vscode from "vscode";


const schema_path = path.join(__dirname, "..", "..", "..", "yara/src/modules_schema.json");
const schema: Object = require(schema_path);

// provide completion for YARA modules
// will have to be static until I can figure out a better method
export const modules = {
    get: function (doc: vscode.TextDocument, pos: vscode.Position): null | (string | vscode.CompletionItemKind)[][] {
        let parsed: Array<string> = doc.lineAt(pos).text.split(" ");
        let symbols: Array<string> = parsed[parsed.length - 1].split(".");
        // start at top level to make sure every symbol can be traced back to a module
        return parseSchema(symbols, schema, 0);
    }
}

function parseSchema(symbols: Array<string>, schema: Object, depth: number): null | (string | vscode.CompletionItemKind)[][] {
    let items: null | (string | vscode.CompletionItemKind)[][] = [];
    let current_symbol: string = symbols[depth];
    if (depth == symbols.length - 1) {
        for (const key in schema) {
            if (schema.hasOwnProperty(key)) {
                const value: string = schema[key];
                let kind_type = vscode.CompletionItemKind.Class;
                if (value == "enum") { kind_type = vscode.CompletionItemKind.Enum; }
                else if (value == "property") { kind_type = vscode.CompletionItemKind.Property; }
                else if (value == "method") { kind_type = vscode.CompletionItemKind.Method; }
                items.push([key, kind_type]);
            }
        }
    }
    else if (schema.hasOwnProperty(current_symbol)) {
        let child: any = schema[current_symbol];
        if (child instanceof Object) {
            items = parseSchema(symbols, child, depth + 1);
        }
    }
    return items;
}

export class YaraCompletionItemProvider implements vscode.CompletionItemProvider {
    public provideCompletionItems(doc: vscode.TextDocument, pos: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        return new Promise((resolve, reject) => {
            if (context.triggerCharacter == ".") {
                let items: vscode.CompletionItem[] = Array<vscode.CompletionItem>();
                let fields: any = modules.get(doc, pos);
                if (fields != null) {
                    fields.forEach(field => {
                        items.push(new vscode.CompletionItem(field[0], field[1]));
                    });
                    console.log(JSON.stringify(items));
                    resolve(items);
                }
            }
            reject();
        });
    }
}
