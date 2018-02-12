"use strict";

import * as proc from "child_process";
import * as path from "path";
import * as vscode from "vscode";


class YaraDefinitionProvider implements vscode.DefinitionProvider {
    public provideDefinition(doc: vscode.TextDocument, pos: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.Location> {
        return new Promise((resolve, reject) => {
            let definition: vscode.Location = null;
            const fileUri: vscode.Uri = vscode.Uri.file(doc.fileName);
            const range: vscode.Range = doc.getWordRangeAtPosition(pos);
            const symbol: string = doc.getText(range);
            console.log(`Providing definition for symbol '${symbol}'`);
            let lines: string[] = doc.getText().split("\n");
            let lineNo = 0;
            lines.forEach(line => {
                let character: number = line.indexOf(symbol);
                // line numbers are offset by one in output - need to adjust
                // only supporting definitions for rules
                if (character != -1 && (lineNo+1) != pos.line && line.startsWith("rule")) {
                    console.log(`Found ${symbol} on line ${lineNo} at character ${character}`);
                    let defPosition: vscode.Position = new vscode.Position(lineNo, character);
                    definition = new vscode.Location(fileUri, defPosition);
                    // Definition found. Break out of forEach
                    return;
                }
                lineNo++;
            });
            if (definition != null) {
                resolve(definition);
            }
            else {
                reject();
            }
        });
    }
}

class YaraReferenceProvider implements vscode.ReferenceProvider {
    public provideReferences(doc: vscode.TextDocument, pos: vscode.Position, options: { includeDeclaration: boolean }, token: vscode.CancellationToken): Thenable<vscode.Location[]> {
        return new Promise((resolve, reject) => {
            let references: vscode.Location[] = new Array<vscode.Location>();
            const fileUri: vscode.Uri = vscode.Uri.file(doc.fileName);
            const range: vscode.Range = doc.getWordRangeAtPosition(pos);
            const symbol: string = doc.getText(range);
            console.log(`Providing references for symbol '${symbol}'`);
            let lines: string[] = doc.getText().split("\n");
            let lineNo = 0;
            lines.forEach(line => {
                let character: number = line.indexOf(symbol);
                if (character != -1) {
                    console.log(`Found ${symbol} on line ${lineNo} at character ${character}`);
                    console.log(line);
                    let refPosition: vscode.Position = new vscode.Position(lineNo, character);
                    references.push(new vscode.Location(fileUri, refPosition));
                }
                lineNo++;
            });
            if (references != null) {
                resolve(references);
            }
            else {
                reject();
            }
        });
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log("Activating Yara extension");
    let YARA: vscode.DocumentSelector = {language: "yara", scheme: "file"};
    let definitionDisposable: vscode.Disposable = vscode.languages.registerDefinitionProvider(YARA, new YaraDefinitionProvider());
    let referenceDisposable: vscode.Disposable = vscode.languages.registerReferenceProvider(YARA, new YaraReferenceProvider());
    context.subscriptions.push(definitionDisposable);
    context.subscriptions.push(referenceDisposable);
};

export function deactivate(context: vscode.ExtensionContext) {
    console.log("Deactivating Yara extension");
    context.subscriptions.forEach(disposable => {
        disposable.dispose();
    });
};
