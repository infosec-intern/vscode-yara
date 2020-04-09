"use strict";

import * as vscode from "vscode";
import {GetRuleRange, varFirstChar} from "./helpers";


export class YaraReferenceProvider implements vscode.ReferenceProvider {
    public provideReferences(doc: vscode.TextDocument, pos: vscode.Position, options: { includeDeclaration: boolean }, token: vscode.CancellationToken): Thenable<vscode.Location[]> {
        return new Promise((resolve, reject) => {
            const fileUri: vscode.Uri = vscode.Uri.file(doc.fileName);
            const range: vscode.Range = doc.getWordRangeAtPosition(pos);
            let lines: string[] = doc.getText().split("\n");
            let references: vscode.Location[] = new Array<vscode.Location>();
            let symbol: string = doc.getText(range);
            // console.log(`Providing references for symbol '${symbol}'`);
            let possibleVarStart: vscode.Position = new vscode.Position(range.start.line, range.start.character - 1);
            let possibleVarRange: vscode.Range = new vscode.Range(possibleVarStart, range.end);
            let possibleVar: string = doc.getText(possibleVarRange);
            if (varFirstChar.has(possibleVar.charAt(0))) {
                let varRegexp: string;
                let startLine: number;
                let endLine: number;
                // console.log(`Identified symbol as a variable: ${symbol}`);
                let possibleWildcardEnd: vscode.Position = new vscode.Position(range.end.line, range.end.character + 1);
                let possibleWildcardRange: vscode.Range = new vscode.Range(possibleVarStart, possibleWildcardEnd);
                let possibleWildcard: string = doc.getText(possibleWildcardRange);
                if (possibleWildcard.slice(-1) == "*") {
                    // treat like a wildcard and search only the local rule
                    varRegexp = `[\$#@!]${symbol}[a-zA-Z0-9_]+`;
                    let ruleRange = GetRuleRange(lines, pos);
                    startLine = ruleRange.start.line;
                    endLine = ruleRange.end.line;
                }
                else {
                    // treat like a normal variable reference and search the whole document
                    varRegexp = `[\$#@!](${symbol}[^a-zA-Z0-9_]|${symbol}$)`;
                    startLine = 0;
                    endLine = lines.length;
                }
                for (let lineNo = startLine; lineNo < endLine; lineNo++) {
                    let character: number = lines[lineNo].search(varRegexp);
                    if (character != -1) {
                        // console.log(`Found ${symbol} on line ${lineNo} at character ${character}`);
                        // have to readjust the character index
                        let refPosition: vscode.Position = new vscode.Position(lineNo, character + 1);
                        references.push(new vscode.Location(fileUri, refPosition));
                    }

                }
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