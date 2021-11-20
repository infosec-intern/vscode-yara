"use strict";

import vscode = require('vscode');
import { debug } from "./configuration";
import {log, GetRuleRange, varFirstChar, IsRuleStart} from "./helpers";


export class YaraDefinitionProvider implements vscode.DefinitionProvider {
    public provideDefinition(doc: vscode.TextDocument, pos: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.Location> {
        return new Promise((resolve, reject) => {
            token.onCancellationRequested(() => {
                if (debug) { log('YaraDefinitionProvider: Task cancelled!'); }
                resolve(undefined);
            });
            try {
                let definition: vscode.Location | null = null;
                const fileUri: vscode.Uri = vscode.Uri.file(doc.fileName);
                const range: vscode.Range = doc.getWordRangeAtPosition(pos);
                const symbol: string = doc.getText(range);
                if (debug) { log(`YaraDefinitionProvider: Providing definition for symbol '${symbol}'`); }
                const possibleVarStart: vscode.Position = new vscode.Position(range.start.line, range.start.character - 1);
                const possibleVarRange: vscode.Range = new vscode.Range(possibleVarStart, range.end);
                const possibleVar: string = doc.getText(possibleVarRange);
                const lines: string[] = doc.getText().split("\n");
                if (varFirstChar.has(possibleVar.charAt(0))) {
                    if (debug) { log(`YaraDefinitionProvider: Variable detected for '${possibleVar}'`); }
                    const currentRuleRange: vscode.Range = GetRuleRange(lines, pos);
                    if (debug) { log(`YaraDefinitionProvider: Rule range of ${currentRuleRange.start.line+1} -> ${currentRuleRange.end.line+1}`); }
                    for (let lineNo = currentRuleRange.start.line; lineNo < currentRuleRange.end.line; lineNo++) {
                        const character: number = lines[lineNo].indexOf(`$${symbol} =`);
                        if (character != -1) {
                            if (debug) { log(`YaraDefinitionProvider: Found definition of '${possibleVar}' on line ${lineNo + 1} at character ${character + 1}`); }
                            // gotta add one because VSCode won't recognize the '$' as part of the symbol
                            const defPosition: vscode.Position = new vscode.Position(lineNo, character + 1);
                            definition = new vscode.Location(fileUri, defPosition);
                            break;
                        }
                    }
                }
                else {
                    for (let lineNo = 0; lineNo < pos.line; lineNo++) {
                        const character: number = lines[lineNo].indexOf(symbol);
                        if (character != -1 && IsRuleStart(lines[lineNo])) {
                            if (debug) { log(`YaraDefinitionProvider: Found ${symbol} on line ${lineNo} at character ${character}`); }
                            const defPosition: vscode.Position = new vscode.Position(lineNo, character);
                            definition = new vscode.Location(fileUri, defPosition);
                            break;
                        }
                    }
                }
                resolve(definition);
            } catch (error) {
                log(`YaraDefinitionProvider error: ${error}`)
                reject(error);
            }
        });
    }
}