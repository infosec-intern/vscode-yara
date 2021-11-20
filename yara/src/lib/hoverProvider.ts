"use strict";

import vscode = require('vscode');
import { debug } from "./configuration";
import { log } from "./helpers";


export class YaraHexStringHoverProvider implements vscode.HoverProvider {
    wordDefinition = new RegExp('{(\\s*([A-F0-9? (|)]|\\[[0-9]*-*[0-9]*\\])\\s*)+}', 'i');

    /*
        Convert a hex string into a human-readable character array, with certain reserved characters unchanged
    */
    public convertHexToChar(hexString: string): string {
        let char = '';
        let charInt = 0;
        const result: Array<string> = new Array<string>();
        const reserved = '?|()';
        for (let index = 0; index < hexString.length; index++) {
            const element = hexString[index];
            if (reserved.includes(element)) {
                result.push(element);
            }
            else if (element.trim() === '') {
                continue;
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
                // treat the next two chars as ASCII and convert to character
                // if they are part of the latin alphabet, english numerals, or certain symbols
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
        if (debug) { log(`YaraHexStringHoverProvider: Converted '${hexString}' to '${result.join("")}'`); }
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
                // lop off the outer brackets
                const innerRange: vscode.Range = new vscode.Range(
                    new vscode.Position(hexRange.start.line, hexRange.start.character+1),
                    new vscode.Position(hexRange.end.line, hexRange.end.character-1)
                );
                const fullTerm: string = doc.getText(innerRange);
                // check the parentheses match
                const openParens: number = (fullTerm.match(/\(/g)||[]).length;
                const closeParens: number = (fullTerm.match(/\)/g)||[]).length;
                if (openParens > closeParens) {
                    const errorMsg = 'YaraHexStringHoverProvider: Not a valid hex string. Expected ")"';
                    if (debug) { log(errorMsg); }
                    hover = new vscode.Hover(errorMsg, innerRange);
                }
                else if (openParens < closeParens) {
                    const errorMsg = 'YaraHexStringHoverProvider: Not a valid hex string. Expected "("';
                    if (debug) { log(errorMsg); }
                    hover = new vscode.Hover(errorMsg, innerRange);
                }
                else {
                    // convert ASCII codes into chars
                    const translated: string = this.convertHexToChar(fullTerm);
                    const contents: vscode.MarkdownString = new vscode.MarkdownString('').appendCodeblock(translated, 'plaintext');
                    hover = new vscode.Hover(contents, innerRange);
                }
            }
            resolve(hover);
        });
    }
}
