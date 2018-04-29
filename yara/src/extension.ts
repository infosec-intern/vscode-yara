"use strict";

import * as vscode from "vscode";
import {YaraCompletionItemProvider} from "./completionProvider";
import {YaraDefinitionProvider} from "./definitionProvider";
import {YaraReferenceProvider} from "./referenceProvider";


export function activate(context: vscode.ExtensionContext) {
    // console.log("Activating Yara extension");
    let YARA: vscode.DocumentSelector = { language: "yara", scheme: "file" };
    let definitionDisposable: vscode.Disposable = vscode.languages.registerDefinitionProvider(YARA, new YaraDefinitionProvider());
    let referenceDisposable: vscode.Disposable = vscode.languages.registerReferenceProvider(YARA, new YaraReferenceProvider());
    let completionDisposable: vscode.Disposable = vscode.languages.registerCompletionItemProvider(YARA, new YaraCompletionItemProvider(), '.');
    context.subscriptions.push(definitionDisposable);
    context.subscriptions.push(referenceDisposable);
    context.subscriptions.push(completionDisposable);
};

export function deactivate(context: vscode.ExtensionContext) {
    // console.log("Deactivating Yara extension");
    context.subscriptions.forEach(disposable => {
        disposable.dispose();
    });
};
