"use strict";

import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext): void {
    console.log("Activating YARA extension");
    vscode.window.showInformationMessage('Web Extension is running!');
}

export function deactivate(context: vscode.ExtensionContext): void {
    console.log("Deactivating YARA extension");
    context.subscriptions.forEach(disposable => {
        disposable.dispose();
    });
}