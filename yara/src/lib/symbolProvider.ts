'use strict';

import vscode = require('vscode');

export class YaraDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    public provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken): Promise<vscode.DocumentSymbol[]> {
        return new Promise((resolve, reject) => {
            const symbols: vscode.DocumentSymbol[] = [];
            for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i);
                if (line.text.startsWith("rule")) {
                    const name = line.text.split(" ")[1]
                    const symbol = new vscode.DocumentSymbol(
                        name, 'Rule',
                        vscode.SymbolKind.Class,
                        line.range, line.range)
                    symbols.push(symbol)
                }
            }
            resolve(symbols);
        });
    }
}