"use strict";

import * as fs from 'fs';
import * as path from "path";
import * as vscode from "vscode";


// e.g. pe.data_directories[].size
type ModuleAttribute = string|Map<string,string>;
// e.g. elf.type, pe.version_info
type ModuleEntry = Map<string,ModuleAttribute>;
// e.g. pe, elf, magic, etc.
type Module = Map<string,ModuleEntry>;
const schema_path: string = path.join(__dirname, "..", "..", "..", "yara/src/modules_schema.json");
const schema: Record<string, Module> = JSON.parse(fs.readFileSync(schema_path, 'utf8'));
const flatModules: vscode.CompletionList = flattenModules();

// provide completion for YARA modules
// will have to be static until I can figure out a better method
export const modules = {
    possibleModules: function (doc: vscode.TextDocument): Array<string> {
        const importRegexp = RegExp("^import \"(pe|elf|cuckoo|magic|hash|math|dotnet|time)\"");
        const results: Array<string> = [];
        doc.getText().split("\n").forEach(line => {
            if (importRegexp.test(line)) {
                results.push(line.split("\"")[1]);
            }
        });
        return results;
    },
    // get: function (doc: vscode.TextDocument, pos: vscode.Position, require_imports: boolean|undefined): null | (string | vscode.CompletionItemKind)[][] {
    get: function (doc: vscode.TextDocument, pos: vscode.Position, require_imports: boolean|undefined): null | vscode.CompletionList {
        const parsed: Array<string> = doc.lineAt(pos).text.split(" ");
        const symbols: Array<string> = parsed[parsed.length - 1].split(".");
        if (require_imports) {
            const filter: Array<string> = this.possibleModules(doc);
            if (filter.indexOf(symbols[0]) > -1) {
                // start at top level to make sure every symbol can be traced back to a module
                // return parseSchema(symbols, schema, 0);
                return flatModules;
            }
            else { return null; }
        }
        else {
            // start at top level to make sure every symbol can be traced back to a module
            return flatModules;
            // return parseSchema(symbols, schema, 0);
        }
    }
}

// function parseSchema(symbols: Array<string>, schema: any, depth: number): null | (string | vscode.CompletionItemKind)[][] {
//     let items: null | (string | vscode.CompletionItemKind)[][] = [];
//     const current_symbol: string = symbols[depth];
//     if (depth == symbols.length - 1) {
//         for (const key in schema) {
//             const value: string = schema[key];
//             let kind_type = vscode.CompletionItemKind.Class;
//             if (value == "enum") { kind_type = vscode.CompletionItemKind.Enum; }
//             else if (value == "property") { kind_type = vscode.CompletionItemKind.Property; }
//             else if (value == "method") { kind_type = vscode.CompletionItemKind.Method; }
//             items.push([key, kind_type]);
//         }
//     }
//     // eslint-disable-next-line no-prototype-builtins
//     else if (schema.hasOwnProperty(current_symbol)) {
//         const child: ModuleEntry|ModuleAttribute = schema[current_symbol];
//         items = parseSchema(symbols, child, depth + 1);
//     }
//     return items;
// }

/*
    Convert the JSON schema of module entries to a flat list of formatted completionitems
*/
function flattenModules(): vscode.CompletionList {
    const entries: vscode.CompletionList = new vscode.CompletionList();
    console.log(schema);
    return entries;
}
