"use strict";

import * as vscode from "vscode";
import { configSection, debug, setDebugLogState } from "../lib/configuration";
import { log } from "../lib/helpers";
import * as helpers from "../lib/helpers";
import { YaraCompletionItemProvider } from "../lib/completionProvider";
import { YaraDefinitionProvider } from "../lib/definitionProvider";
import { YaraReferenceProvider } from "../lib/referenceProvider";
import { YaraSnippetCompletionItemProvider } from "../lib/snippetProvider";
import { YaraHexStringHoverProvider } from "../lib/hoverProvider";


export function activate(context: vscode.ExtensionContext): void {
    // clear output channel and set up appropriate level of logging
    helpers.output.clear();
    log("Activating YARA extension");
    setDebugLogState();
    // register all the different providers for the extension
    const YARA: vscode.DocumentSelector = { language: "yara", scheme: "file" };
    const definitionDisposable: vscode.Disposable = vscode.languages.registerDefinitionProvider(YARA, new YaraDefinitionProvider());
    if (debug) { log("Registered definition provider"); }
    context.subscriptions.push(definitionDisposable);
    const referenceDisposable: vscode.Disposable = vscode.languages.registerReferenceProvider(YARA, new YaraReferenceProvider());
    if (debug) { log("Registered reference provider"); }
    context.subscriptions.push(referenceDisposable);
    const completionDisposable: vscode.Disposable = vscode.languages.registerCompletionItemProvider(YARA, new YaraCompletionItemProvider(), '.');
    if (debug) { log("Registered module completion provider"); }
    context.subscriptions.push(completionDisposable);
    const snippetsDisposable: vscode.Disposable = vscode.languages.registerCompletionItemProvider(YARA, new YaraSnippetCompletionItemProvider());
    if (debug) { log("Registered snippet provider"); }
    context.subscriptions.push(snippetsDisposable);
    const hoverDisposable: vscode.Disposable = vscode.languages.registerHoverProvider(YARA, new YaraHexStringHoverProvider());
    if (debug) { log("Registered hover provider"); }
    context.subscriptions.push(hoverDisposable);
    // watch configuration for changes to update log level
    const configWatcher: vscode.Disposable = vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
        if (e.affectsConfiguration(configSection)) {
            setDebugLogState();
        }
    });
    context.subscriptions.push(configWatcher);
    if (debug) { log('Registered configuration watcher'); }
}

export function deactivate(context: vscode.ExtensionContext): void {
    log("Deactivating YARA extension");
    context.subscriptions.forEach(disposable => {
        disposable.dispose();
    });
}
