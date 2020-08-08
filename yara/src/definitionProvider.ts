"use strict";

import * as vscode from "vscode";
import {GetRuleRange, varFirstChar, IsRuleStart} from "./helpers";


export class YaraDefinitionProvider implements vscode.DefinitionProvider {
    public provideDefinition(doc: vscode.TextDocument, pos: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.Location> {
        return new Promise((resolve, reject) => {
            let definition: vscode.Location | null = null;
            const fileUri: vscode.Uri = vscode.Uri.file(doc.fileName);
            const range: vscode.Range = doc.getWordRangeAtPosition(pos);
            const symbol: string = doc.getText(range);
            // console.log(`Providing definition for symbol '${symbol}'`);
            let possibleVarStart: vscode.Position = new vscode.Position(range.start.line, range.start.character - 1);
            let possibleVarRange: vscode.Range = new vscode.Range(possibleVarStart, range.end);
            let possibleVar: string = doc.getText(possibleVarRange);
            const lines: string[] = doc.getText().split("\n");
            if (varFirstChar.has(possibleVar.charAt(0))) {
                // console.log(`Variable detected: ${possibleVar}`);
                let currentRuleRange: vscode.Range = GetRuleRange(lines, pos);
                // console.log(`Curr rule range: ${currentRuleRange.start.line+1} -> ${currentRuleRange.end.line+1}`);
                for (let lineNo = currentRuleRange.start.line; lineNo < currentRuleRange.end.line; lineNo++) {
                    let character: number = lines[lineNo].indexOf(`$${symbol} =`);
                    if (character != -1) {
                        // console.log(`Found defintion of '${possibleVar}' on line ${lineNo + 1} at character ${character + 1}`);
                        // gotta add one because VSCode won't recognize the '$' as part of the symbol
                        let defPosition: vscode.Position = new vscode.Position(lineNo, character + 1);
                        definition = new vscode.Location(fileUri, defPosition);
                        break;
                    }
                }
            }
            else {
                for (let lineNo = 0; lineNo < pos.line; lineNo++) {
                    let character: number = lines[lineNo].indexOf(symbol);
                    if (character != -1 && IsRuleStart(lines[lineNo])) {
                        // console.log(`Found ${symbol} on line ${lineNo} at character ${character}`);
                        let defPosition: vscode.Position = new vscode.Position(lineNo, character);
                        definition = new vscode.Location(fileUri, defPosition);
                        break;
                    }
                }
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