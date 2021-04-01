'use strict';

import * as vscode from 'vscode';

/*
    Extract a variable name from a snippet variable string (e.g. ${TM_FILENAME} => TM_FILENAME)
*/
function getVariableNameFromString(rawSnippet: string): string {
    // remove curly braces denoting a variable and any transform that starts after the first '/'
    return rawSnippet.replace('${', '').replace('}', '').split('/').shift().toUpperCase();
}

function generateMetaSnippet(): vscode.SnippetString {
    const varRegex = new RegExp('\\${[A-Z_]+?}', 'gi');
    const wholeLineRegex = new RegExp(`^${varRegex.source}$`, 'i')
    // const varRegex = new RegExp('\\$\\{\\S+?\\}', 'g');
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
        const metaValue = String(metaConfig[key]);
        if (metaValue === '') {
            // use tabstops when the user wants a pre-set key, but not a pre-filled value
            // ... to make it easier to fill these in when generating the rule
            snippet.appendText(`\t${key} = "`);
            snippet.appendTabstop();
            snippet.appendText(`"\n`);
        }
        else if (wholeLineRegex.test(metaValue)) {
            console.log(`the entire line '${metaValue}' is a variable`);
            const match: RegExpExecArray = wholeLineRegex.exec(metaValue);
            if (match === null) {
                console.log(`Somehow we didn't extract anything from '${wholeLineRegex.source}' for '${metaValue}'`);
                // TODO: Raise some kind of error to user - probably in an output window
                return;
            }
            const variableName: string = getVariableNameFromString(match.shift());
            snippet.appendText(`\t${key} = "`);
            snippet.appendVariable(variableName, '');
            snippet.appendText(`"\n`);
        }
        else if (varRegex.test(metaValue)) {
            snippet.appendText(`\t${key} = "`);
            console.log(`found value with variable: ${metaValue}`);
            // need to make a second regexp pattern, because for some reason global Regexp objects don't match the first value
            let currIndex = 0;
            let match: RegExpExecArray;
            while ((match = varRegex.exec(metaValue)) !== null) {
                if (match.index > currIndex) {
                    // if we have a match after our previous append, then
                    // ... append all the characters from the previous position up to the match
                    snippet.appendText(metaValue.substring(currIndex, match.index));
                }
                const variableMatch: string = match.shift();
                const variableName: string = getVariableNameFromString(variableMatch);
                snippet.appendVariable(variableName, '');
                // move the index up to just after the variable
                currIndex = match.index + variableMatch.length;
            }
            snippet.appendText(`"\n`);
        }
        else {
            snippet.appendText(`\t${key} = "${metaValue}"\n`);
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
