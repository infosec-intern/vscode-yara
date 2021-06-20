"use strict";

import * as vscode from 'vscode';
import { debug } from "./configuration";
import { log } from "./helpers";


export class YaraHexStringHoverProvider implements vscode.HoverProvider {
    // {6A 40 68 00 30 00 00 6A 14 8D 91}
    // { F4 23 [4-6] 62 B4 }
    // {FE 39 45 ?? ?? ?? ?? ?? ?? 89 00}
    // {FE 39 45 [10-] 89 00}
    // {FE 39 45 [-] 89 00}
    wordDefinition = new RegExp('{(\\s*([A-F0-9? (|)]{2}|\\[[0-9]*-*[0-9]*\\]|)\\s*)+}', 'i');

    /*
        Convert a hex string into a human-readable character array, with certain reserved characters unchanged
    */
    private convertHexToChar(hexString: string): string {
        let char = '';
        let charInt = 0;
        const result: Array<string> = new Array<string>();
        const reserved = '?|(){}';
        for (let index = 0; index < hexString.length; index++) {
            const element = hexString[index];
            if (reserved.includes(element) || element.trim() === '') {
                result.push(element);
            }
            else if (element === '[') {
                // pull every element inside the jump, including brackets
                do {
                    char = hexString[index];
                    index++;
                    result.push(char);
                }
                while (char !== ']');
            }
            else {
                char = hexString.substr(index, 2);
                charInt = parseInt(char, 16);
                if ((32 <= charInt) && (charInt <= 126)) {
                    result.push(String.fromCharCode(charInt));
                    index++;
                }
                else {
                    result.push('.');
                    index++;
                }
            }
        }
        return result.join('');
    }

    public provideHover(doc: vscode.TextDocument, pos: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        return new Promise((resolve) => {
            token.onCancellationRequested(() => {
                if (debug) { log('YaraHexStringHoverProvider: Task cancelled!'); }
                resolve(undefined);
            });
            let hover: vscode.Hover|undefined = undefined;
            const hexRange: vscode.Range|undefined = doc.getWordRangeAtPosition(pos, this.wordDefinition);
            if (hexRange !== undefined) {
                const fullTerm: string = doc.getText(hexRange);
                // check the parentheses match
                const openParens: number = (fullTerm.match(/\(/g)||[]).length;
                const closeParens: number = (fullTerm.match(/\)/g)||[]).length;
                if (openParens !== closeParens) {
                    if (debug) { log(`Number of open parentheses (${openParens}) did not match close parentheses (${closeParens})! Not a valid hex string`); }
                }
                else {
                    // convert ASCII codes into chars
                    const translated: string = this.convertHexToChar(fullTerm);
                    hover = new vscode.Hover(translated, hexRange);
                }
            }
            resolve(hover);
        });
    }
}
