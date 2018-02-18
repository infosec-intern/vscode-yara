"use strict";

import * as vscode from "vscode";


// variables have a few possible first characters - use these to identify vars vs. rules
const varFirstChar = new Set(["$", "#", "@", "!"]);

export class YaraDefinitionProvider implements vscode.DefinitionProvider {
    public provideDefinition(doc: vscode.TextDocument, pos: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.Location> {
        return new Promise((resolve, reject) => {
            let definition: vscode.Location = null;
            const fileUri: vscode.Uri = vscode.Uri.file(doc.fileName);
            const range: vscode.Range = doc.getWordRangeAtPosition(pos);
            const symbol: string = doc.getText(range);
            // console.log(`Providing definition for symbol '${symbol}'`);
            let possibleVarStart: vscode.Position = new vscode.Position(range.start.line, range.start.character-1);
            let possibleVarRange: vscode.Range = new vscode.Range(possibleVarStart, range.end);
            let possibleVar: string = doc.getText(possibleVarRange);
            if (varFirstChar.has(possibleVar.charAt(0))) {
                // console.log(`Variable detected: ${possibleVar}`);
                const lines: string[] = doc.getText().split("\n");
                let currRuleBegin: number = 0;
                let currRuleEnd: number = 0;
                const startRuleRegexp = RegExp("^rule ");
                const endRuleRegexp = RegExp("^\}");
                // only go up to the symbol's line because the rule must be
                // defined before the symbol
                for (let lineNo = 0; lineNo < pos.line; lineNo++) {
                    if (startRuleRegexp.test(lines[lineNo])) {
                        currRuleBegin = lineNo;
                    }
                }
                // start up this loop again using the beginning of the rule
                // and find the line with just a curly brace to identify the end of a rule
                for (let lineNo = currRuleBegin; lineNo < lines.length; lineNo++) {
                    if (endRuleRegexp.test(lines[lineNo])) {
                        currRuleEnd = lineNo;
                        break;
                    }
                }
                console.log(`Curr rule range: ${currRuleBegin} -> ${currRuleEnd}`);
                for (let lineNo = currRuleBegin; lineNo < currRuleEnd; lineNo++) {
                    let character: number = lines[lineNo].indexOf(`$${symbol} =`);
                    if (character != -1) {
                        console.log(`Found defintion of '${possibleVar}' on line ${lineNo} at character ${character}`);
                        let defPosition: vscode.Position = new vscode.Position(lineNo, character);
                        definition = new vscode.Location(fileUri, defPosition);
                    }
                }
            }
            else {
                let lines: string[] = doc.getText().split("\n");
                let lineNo = 0;
                lines.forEach(line => {
                    let character: number = line.indexOf(symbol);
                    // line numbers are offset by one in output - need to adjust
                    // only supporting definitions for rules
                    if (character != -1 && (lineNo+1) != pos.line && line.startsWith("rule")) {
                        // console.log(`Found ${symbol} on line ${lineNo} at character ${character}`);
                        let defPosition: vscode.Position = new vscode.Position(lineNo, character);
                        definition = new vscode.Location(fileUri, defPosition);
                        // Definition found. Break out of forEach
                        return;
                    }
                    lineNo++;
                });
            }
            if (definition != null) {
                resolve(definition);
            }
            else {
                reject();
            }
        });
    }
}

export class YaraReferenceProvider implements vscode.ReferenceProvider {
    public provideReferences(doc: vscode.TextDocument, pos: vscode.Position, options: { includeDeclaration: boolean }, token: vscode.CancellationToken): Thenable<vscode.Location[]> {
        return new Promise((resolve, reject) => {
            const fileUri: vscode.Uri = vscode.Uri.file(doc.fileName);
            const range: vscode.Range = doc.getWordRangeAtPosition(pos);
            let lines: string[] = doc.getText().split("\n");
            let references: vscode.Location[] = new Array<vscode.Location>();
            let symbol: string = doc.getText(range);
            // console.log(`Providing references for symbol '${symbol}'`);
            let possibleVarStart: vscode.Position = new vscode.Position(range.start.line, range.start.character-1);
            let possibleVarRange: vscode.Range = new vscode.Range(possibleVarStart, range.end);
            let possibleVar: string = doc.getText(possibleVarRange);
            if (varFirstChar.has(possibleVar.charAt(0))) {
                // console.log(`Identified symbol as a variable: ${symbol}`);
                let lineNo = 0;
                lines.forEach(line => {
                    let character: number = line.search(`[\$#@!]${symbol}[^a-zA-Z0-9_]`);
                    if (character != -1) {
                        // console.log(`Found ${symbol} on line ${lineNo} at character ${character}`);
                        // have to readjust the character index
                        let refPosition: vscode.Position = new vscode.Position(lineNo, character+1);
                        references.push(new vscode.Location(fileUri, refPosition));
                    }
                    lineNo++;
                });
            }
            else {
                let lineNo = 0;
                lines.forEach(line => {
                    let character: number = line.indexOf(symbol);
                    if (character != -1) {
                        // console.log(`Found ${symbol} on line ${lineNo} at character ${character}`);
                        let refPosition: vscode.Position = new vscode.Position(lineNo, character);
                        references.push(new vscode.Location(fileUri, refPosition));
                    }
                    lineNo++;
                });
            }
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
    // console.log("Activating Yara extension");
    let YARA: vscode.DocumentSelector = {language: "yara", scheme: "file"};
    let definitionDisposable: vscode.Disposable = vscode.languages.registerDefinitionProvider(YARA, new YaraDefinitionProvider());
    let referenceDisposable: vscode.Disposable = vscode.languages.registerReferenceProvider(YARA, new YaraReferenceProvider());
    context.subscriptions.push(definitionDisposable);
    context.subscriptions.push(referenceDisposable);
};

export function deactivate(context: vscode.ExtensionContext) {
    // console.log("Deactivating Yara extension");
    context.subscriptions.forEach(disposable => {
        disposable.dispose();
    });
};
