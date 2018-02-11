"use strict";

import * as proc from "child_process";
import * as path from "path";
import * as vscode from "vscode";


class YaraDefinitionProvider implements vscode.DefinitionProvider {
    public provideDefinition(doc: vscode.TextDocument, pos: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.Location> {
        // only look for definitions in the current document ... at first
        const filename = vscode.Uri.file(doc.fileName);
        // grab the character range for the current symbol to define
        const range = doc.getWordRangeAtPosition(pos);
        // grab the actual symbol to define
        const symbol = doc.getText(range);
        // assume the symbol isn't defined anywhere
        let results = new vscode.Location(filename, range);
        return null;
    }
}

class YaraReferenceProvider implements vscode.ReferenceProvider {
    public provideReferences(doc: vscode.TextDocument, pos: vscode.Position, options: { includeDeclaration: boolean }, token: vscode.CancellationToken): Thenable<vscode.Location[]> {
        const filename = vscode.Uri.file(doc.fileName);
        const range = doc.getWordRangeAtPosition(pos);
        const symbol = doc.getText(range);
        // assume the symbol isn't defined anywhere
        let results = new vscode.Location(filename, range);
        return null;
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
