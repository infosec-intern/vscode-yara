"use strict";

import * as path from "path";
import * as vscode from "vscode";


let schema_path = path.join(__dirname, "..", "..", "..", "yara/src/modules_schema.json");
let schema: Object = require(schema_path);

// provide completion for YARA modules
// will have to be static until I can figure out a better method
export const modules = {
    get: function (symbol: string) {
        let items: null | Array<string> = null;
        console.log(`symbol: ${symbol}`);
        if (schema.hasOwnProperty(symbol)) {
            let submodule = schema[symbol].valueOf();
        }
        return items;
    }
};

function parseItemKind(kindString: string) {
    let kindType = vscode.CompletionItemKind.Keyword;
    if (kindString == "enum") { kindType = vscode.CompletionItemKind.Enum; }
    else if (kindString == "property") { kindType = vscode.CompletionItemKind.Property; }
    else if (kindString == "method") { kindType = vscode.CompletionItemKind.Method; }
    return kindType;
}
