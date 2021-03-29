'use strict';

import * as vscode from 'vscode';


function generateMetaSnippet(): vscode.SnippetString {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('yara');
    const metaConfig: unknown = config.get('meta_entries');
    const metaKeys: Array<string> = Object.keys(metaConfig).filter((key: string) => {
        // filter out empty keys
        return Boolean(key.trim());
    });
    if (config.get('sort_meta')) {
        metaKeys.sort();
    }
    const snippet: vscode.SnippetString = new vscode.SnippetString('meta:\n');
    metaKeys.forEach((key: string) => {
        if (metaConfig[key] === '') {
            // use tabstops when the user wants a pre-set key, but not a pre-filled value
            // ... to make it easier to fill these in when generating the rule
            snippet.appendText(`\t${key} = "`);
            snippet.appendTabstop();
            snippet.appendText(`"\n`);
        }
        else {
            snippet.appendText(`\t${key} = "${metaConfig[key]}"\n`);
        }
    });
    // remove any extra newlines that may have popped up
    snippet.value = snippet.value.trim();
    return snippet;
}

export class YaraSnippetCompletionItemProvider implements vscode.CompletionItemProvider {
    // term to search for in order to provide the user with results
    prefix = 'meta';

    public provideCompletionItems(doc: vscode.TextDocument, pos: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionList> {
        return new Promise((resolve, reject) => {
            token.onCancellationRequested(reject);
            try {
                const fullTerm: string = doc.getText(doc.getWordRangeAtPosition(pos));
                if (fullTerm.startsWith(this.prefix)) {
                    const items: vscode.CompletionList = new vscode.CompletionList();
                    const item: vscode.CompletionItem = new vscode.CompletionItem('meta', vscode.CompletionItemKind.Snippet);
                    const docs: vscode.MarkdownString = new vscode.MarkdownString('');
                    // should always show up when setting this
                    item.filterText = fullTerm;
                    item.detail = 'Generate a \'meta\' section (YARA)';
                    // default, just in case something goes wrong during resolution
                    docs.appendCodeblock('meta:\n\tkey = "value"');
                    item.documentation = docs;
                    item.insertText = new vscode.SnippetString('meta:\n\t$1 = "$2"');
                    items.items.push(item);
                    resolve(items);
                }
                else {
                    reject();
                }
            } catch (error) {
                console.log(`YaraSnippetCompletionItemProvider: ${error}`);
                reject();
            }
        });
    }

    public resolveCompletionItem(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
        return new Promise((resolve) => {
            token.onCancellationRequested(resolve);
            const metaSnippet: vscode.SnippetString = generateMetaSnippet();
            item.insertText = metaSnippet;
            item.documentation = new vscode.MarkdownString('');
            item.documentation.appendCodeblock(metaSnippet.value);
            resolve(item);
        });
    }
}
