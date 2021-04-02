'use strict';

import * as vscode from 'vscode';


const BASIC_META: vscode.CompletionItem = new vscode.CompletionItem('meta', vscode.CompletionItemKind.Snippet);
BASIC_META.detail = 'Generate a \'meta\' section (YARA)';
BASIC_META.insertText = new vscode.SnippetString('meta:\n\t$1 = "$2"');
BASIC_META.documentation = new vscode.MarkdownString('');
BASIC_META.documentation.appendCodeblock('meta:\n\tKEY = "VALUE"');

const BASIC_CONDITION: vscode.CompletionItem = new vscode.CompletionItem('condition', vscode.CompletionItemKind.Snippet);
BASIC_CONDITION.detail = 'Generate a \'condition\' section (YARA)';
BASIC_CONDITION.insertText = new vscode.SnippetString('condition:\n\t${1:conditions}');
BASIC_CONDITION.documentation = new vscode.MarkdownString('');
BASIC_CONDITION.documentation.appendCodeblock('condition:\n\tCONDITIONS');

const BASIC_RULE: vscode.CompletionItem = new vscode.CompletionItem('rule', vscode.CompletionItemKind.Snippet);
BASIC_RULE.detail = 'Generate a rule skeleton (YARA)';
BASIC_RULE.insertText = new vscode.SnippetString('rule ${1:$TM_FILENAME_BASE} {\n\t');
BASIC_RULE.documentation = new vscode.MarkdownString('');
BASIC_RULE.documentation.appendCodeblock('rule NAME {');

const BASIC_STRINGS: vscode.CompletionItem = new vscode.CompletionItem('strings', vscode.CompletionItemKind.Snippet);
BASIC_STRINGS.detail = 'Generate a \'strings\' section (YARA)';
BASIC_STRINGS.insertText = new vscode.SnippetString('strings:\n\t${1:name} = "${2:string}"');
BASIC_STRINGS.documentation = new vscode.MarkdownString('');
BASIC_STRINGS.documentation.appendCodeblock('strings:\n\tNAME = "STRING"');

/*
    Extract a variable name from a snippet variable string (e.g. ${TM_FILENAME} => TM_FILENAME)
*/
function getVariableNameFromString(rawSnippet: string): string {
    // remove curly braces denoting a variable and any transform that starts after the first '/'
    return rawSnippet.replace('${', '').replace('}', '').split('/').shift().toUpperCase();
}

function generateConditionSnippet(snippet: vscode.SnippetString = new vscode.SnippetString(), numTabs = 0): vscode.SnippetString {
    const tabs = '\t'.repeat(numTabs);
    snippet.appendText(`${tabs}condition:\n`);
    snippet.appendText(`${tabs}\t`);
    snippet.appendPlaceholder('any of them');
    return snippet;
}

function generateMetaSnippet(snippet: vscode.SnippetString = new vscode.SnippetString(), numTabs = 0): vscode.SnippetString {
    const tabs = '\t'.repeat(numTabs);
    const varRegex = new RegExp('\\${[A-Z_]+?}', 'gi');
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('yara');
    const metaConfig: unknown = config.get('meta_entries');
    const metaKeys: Array<string> = Object.keys(metaConfig).filter((key: string) => {
        // filter out empty keys
        return Boolean(key.trim());
    });
    if (config.get('sort_meta')) {
        metaKeys.sort();
    }
    snippet.appendText(`${tabs}meta:\n`)
    metaKeys.forEach((key: string) => {
        const metaValue = String(metaConfig[key]);
        if (metaValue === '') {
            // use tabstops when the user wants a pre-set key, but not a pre-filled value
            // ... to make it easier to fill these in when generating the rule
            snippet.appendText(`${tabs}\t${key} = "`);
            snippet.appendTabstop();
            snippet.appendText(`"\n`);
        }
        else if (varRegex.test(metaValue)) {
            varRegex.lastIndex = 0;
            snippet.appendText(`${tabs}\t${key} = "`);
            let currIndex = 0;
            let match: RegExpExecArray;
            while ((match = varRegex.exec(metaValue)) !== null) {
                // if we have a match after our previous append, then
                // ... append all the characters from the previous position up to the match
                snippet.appendText(metaValue.substring(currIndex, match.index));
                const variableMatch: string = match.shift();
                const variableName: string = getVariableNameFromString(variableMatch);
                snippet.appendVariable(variableName, '');
                // move the index up to just after the variable
                currIndex = varRegex.lastIndex;
            }
            snippet.appendText(`"\n`);
        }
        else {
            snippet.appendText(`${tabs}\t${key} = "${metaValue}"\n`);
        }
    });
    // remove any extra newlines that may have popped up
    snippet.value = snippet.value.trim();
    return snippet;
}

function generateRuleSnippet(snippet: vscode.SnippetString = new vscode.SnippetString()): vscode.SnippetString {
    snippet.appendText('rule ');
    snippet.appendPlaceholder('my_rule');
    snippet.appendText(' {\n');
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('yara');
    const metaConfig: unknown = config.get('meta_entries');
    const metaKeys: Array<string> = Object.keys(metaConfig).filter((key: string) => {
        // filter out empty keys
        return Boolean(key.trim());
    });
    if (config.get('sort_meta')) {
        metaKeys.sort();
    }
    // meta
    generateMetaSnippet(snippet, 1);
    snippet.appendText('\n');
    generateStringSnippet(snippet, 1);
    snippet.appendText('\n');
    generateConditionSnippet(snippet, 1);
    snippet.appendText('\n}\n');
    return snippet;
}

function generateStringSnippet(snippet: vscode.SnippetString = new vscode.SnippetString(), numTabs = 0): vscode.SnippetString {
    const tabs = '\t'.repeat(numTabs);
    snippet.appendText(`${tabs}strings:\n`);
    snippet.appendText(`${tabs}\t`);
    snippet.appendPlaceholder('name');
    snippet.appendText(' = ')
    snippet.appendChoice(['"string"', '/regex/', '{ HEX }']);
    return snippet;
}

export class YaraSnippetCompletionItemProvider implements vscode.CompletionItemProvider {
    basicItems: vscode.CompletionList = new vscode.CompletionList([BASIC_CONDITION, BASIC_META, BASIC_RULE, BASIC_STRINGS]);

    public provideCompletionItems(doc: vscode.TextDocument, pos: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionList> {
        return new Promise((resolve, reject) => {
            token.onCancellationRequested(reject);
            try {
                // TODO: Only provide sections when inside a rule
                resolve(this.basicItems);
            } catch (error) {
                console.log(`YaraSnippetCompletionItemProvider: ${error}`);
                reject();
            }
        });
    }

    public resolveCompletionItem(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
        return new Promise((resolve) => {
            token.onCancellationRequested(resolve);
            let snippet: vscode.SnippetString|string = item.insertText;
            switch (item.label) {
                case 'condition':
                    snippet = generateConditionSnippet();
                    break;
                case 'meta':
                    snippet = generateMetaSnippet();
                    break;
                case 'rule':
                    snippet = generateRuleSnippet();
                    break;
                case 'strings':
                    snippet = generateStringSnippet();
                    break;
                default:
                    console.log(`I don't know what this snippet is: ${item.label} => ${JSON.stringify(item)}`);
                    break;
            }
            item.insertText = snippet;
            item.documentation = new vscode.MarkdownString('');
            if (snippet instanceof vscode.SnippetString) {
                item.documentation.appendCodeblock(snippet.value);
            }
            else {
                item.documentation.appendCodeblock(snippet);
            }
            resolve(item);
        });
    }
}
