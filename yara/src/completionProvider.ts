"use strict";

import * as vscode from "vscode";
import { modules } from "./modules";


export class YaraCompletionItemProvider implements vscode.CompletionItemProvider {
    public provideCompletionItems(doc: vscode.TextDocument, pos: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionList> {
        return new Promise((resolve, reject) => {
            if (context == undefined || context.triggerCharacter == ".") {
                const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("yara");
                const items: vscode.CompletionList = modules.get(doc, pos, config.get("require_imports", false));
                // const fields: (string | vscode.CompletionItemKind)[][] = modules.get(doc, pos, config.get("require_imports", false));
                // let items: vscode.CompletionItem[] = Array<vscode.CompletionItem>();
                // items = fields.map<vscode.CompletionItem>((field: Array<string|vscode.CompletionItemKind>) => {
                //     return new vscode.CompletionItem(field[0] as string, field[1] as vscode.CompletionItemKind);
                // });
                resolve(items);
            }
            reject();
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
