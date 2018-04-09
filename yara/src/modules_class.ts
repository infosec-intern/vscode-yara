"use strict";

import * as path from "path";
import * as vscode from "vscode";


const schema_path = path.join(__dirname, "..", "..", "..", "yara/src/modules_schema.json");
const schema: Object = require(schema_path);

// provide completion for YARA modules
// will have to be static until I can figure out a better method
export const modules = {
    get: function (doc: vscode.TextDocument, pos: vscode.Position) {
        let items: null | (string|vscode.CompletionItemKind)[][] = [];
        let parsed: Array<string> = doc.lineAt(pos).text.split(" ");
        let symbols: Array<string> = parsed[parsed.length - 1].split(".");
        // start at top level to make sure every symbol can be traced back to a module
        let module_name: string = symbols[0];
        items = parseSchema(symbols, schema, 0);
        return items;
    }
};

function parseSchema(symbols: Array<string>, schema: Object, depth: number) {
    let items: null | (string|vscode.CompletionItemKind)[][] = [];
    let current_symbol: string = symbols[depth];
    if (depth == symbols.length - 1) {
        console.log("At the end of symbols");
        for (const key in schema) {
            if (schema.hasOwnProperty(key)) {
                const value: string = schema[key];
                let kind_type = vscode.CompletionItemKind.Class;
                if (value == "enum") { kind_type = vscode.CompletionItemKind.Enum; }
                else if (value == "property") { kind_type = vscode.CompletionItemKind.Property; }
                else if (value == "method") { kind_type = vscode.CompletionItemKind.Method; }
                items.push([key, kind_type]);
            }
            console.log(`items: ${JSON.stringify(items)}`);
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
