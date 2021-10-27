"use strict";

import * as vscode from "vscode";
import { debug } from "./configuration";
import { log, GetRuleRange, varFirstChar } from "./helpers";


export class YaraReferenceProvider implements vscode.ReferenceProvider {
    public provideReferences(doc: vscode.TextDocument, pos: vscode.Position, ctx: vscode.ReferenceContext, token: vscode.CancellationToken): Thenable<vscode.Location[]> {
        return new Promise((resolve, reject) => {
            token.onCancellationRequested(() => {
                if (debug) { log('YaraReferenceProvider: Task cancelled!'); }
                resolve(undefined);
            });
            const fileUri: vscode.Uri = vscode.Uri.file(doc.fileName);
            const range: vscode.Range = doc.getWordRangeAtPosition(pos);
            const lines: string[] = doc.getText().split("\n");
            const references: vscode.Location[] = new Array<vscode.Location>();
            const symbol: string = doc.getText(range);
            if (debug) { log(`YaraReferenceProvider: Providing references for symbol '${symbol}'`); }
            const possibleVarStart: vscode.Position = new vscode.Position(range.start.line, range.start.character - 1);
            const possibleVarRange: vscode.Range = new vscode.Range(possibleVarStart, range.end);
            const possibleVar: string = doc.getText(possibleVarRange);
            if (varFirstChar.has(possibleVar.charAt(0))) {
                let varRegexp: string;
                let startLine: number;
                let endLine: number;
                if (debug) { log(`YaraReferenceProvider: Identified symbol as a variable: ${symbol}`); }
                const possibleWildcardEnd: vscode.Position = new vscode.Position(range.end.line, range.end.character + 1);
                const possibleWildcardRange: vscode.Range = new vscode.Range(possibleVarStart, possibleWildcardEnd);
                const possibleWildcard: string = doc.getText(possibleWildcardRange);
                if (possibleWildcard.slice(-1) == "*") {
                    // treat like a wildcard and search only the local rule
                    varRegexp = `[$#@!]${symbol}[a-zA-Z0-9_]+`;
                    const ruleRange = GetRuleRange(lines, pos);
                    startLine = ruleRange.start.line;
                    endLine = ruleRange.end.line;
                }
                else {
                    // treat like a normal variable reference and search the whole document
                    varRegexp = `[$#@!](${symbol}[^a-zA-Z0-9_]|${symbol}$)`;
                    startLine = 0;
                    endLine = lines.length;
                }
                for (let lineNo = startLine; lineNo < endLine; lineNo++) {
                    const character: number = lines[lineNo].search(varRegexp);
                    if (character != -1) {
                        if (debug) { log(`YaraReferenceProvider: Found ${symbol} on line ${lineNo} at character ${character}`); }
                        // have to readjust the character index
                        const refPosition: vscode.Position = new vscode.Position(lineNo, character + 1);
                        references.push(new vscode.Location(fileUri, refPosition));
                    }

                }
            }
            else {
                let lineNo = 0;
                lines.forEach(line => {
                    const character: number = line.indexOf(symbol);
                    if (character != -1) {
                        if (debug) { log(`YaraReferenceProvider: Found ${symbol} on line ${lineNo} at character ${character}`); }
                        const refPosition: vscode.Position = new vscode.Position(lineNo, character);
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