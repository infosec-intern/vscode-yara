'use strict';

import * as vscode from 'vscode';
import { debug } from "./configuration";
import { log } from "./helpers";

const configName = 'yara';

/*
    Extract a variable name from a snippet variable string (e.g. ${TM_FILENAME} => TM_FILENAME)
*/
function getVariableNameFromString(rawSnippet: string): string {
    // remove curly braces denoting a variable and any transform that starts after the first '/'
    return rawSnippet.replace('${', '').replace('}', '').split('/').shift().toUpperCase();
}

function generateConditionSnippet(snippet: vscode.SnippetString = new vscode.SnippetString(), numTabs = 0): vscode.SnippetString {
    if (debug) { log("YaraSnippetCompletionItemProvider: Generating 'condition' snippet"); }
    const tabs = '\t'.repeat(numTabs);
    snippet.appendText(`${tabs}condition:\n`);
    snippet.appendText(`${tabs}\t`);
    snippet.appendPlaceholder('any of them');
    return snippet;
}

function generateMetaSnippet(snippet: vscode.SnippetString = new vscode.SnippetString(), numTabs = 0): vscode.SnippetString {
    if (debug) { log("YaraSnippetCompletionItemProvider: Generating 'meta' snippet"); }
    const tabs = '\t'.repeat(numTabs);
    const varRegex = new RegExp('\\${[A-Z_]+?}', 'gi');
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(configName);
    const metaConfig: unknown = config.get('metaEntries');
    const metaKeys: Array<string> = Object.keys(metaConfig).filter((key: string) => {
        // filter out empty keys
        return Boolean(key.trim());
    });
    if (config.get('sortMeta')) {
        metaKeys.sort();
    }
    snippet.appendText(`${tabs}meta:\n`);
    if (metaKeys.length == 0) {
        // just provide some simple tabstops for the user to add their own metadata
        snippet.appendText(`${tabs}\t`);
        snippet.appendPlaceholder('KEY');
        snippet.appendText(' = ');
        snippet.appendPlaceholder('"VALUE"');
    }
    else {
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
    }
    // TODO: it would be really cool to just hit enter here and keep generating metadata snippet entries
    // ... not sure how to identify when a user just wants a newline though
    // remove any extra newlines that may have popped up
    snippet.value = snippet.value.trim();
    return snippet;
}

function generateRuleSnippet(snippet: vscode.SnippetString = new vscode.SnippetString()): vscode.SnippetString {
    if (debug) { log("YaraSnippetCompletionItemProvider: Generating 'rule' snippet"); }
    snippet.appendText('rule ');
    // TODO: Find a way to mix variables and placeholders, so TM_FILENAME_BASE can be the default and also a placeholder
    snippet.appendPlaceholder('my_rule');
    // TODO: Should the curly brace be on its own line?
    snippet.appendText(' {\n');
    generateMetaSnippet(snippet, 1);
    snippet.appendText('\n');
    generateStringSnippet(snippet, 1);
    snippet.appendText('\n');
    generateConditionSnippet(snippet, 1);
    snippet.appendText('\n');
    snippet.appendText('}\n');
    return snippet;
}

function generateStringSnippet(snippet: vscode.SnippetString = new vscode.SnippetString(), numTabs = 0): vscode.SnippetString {
    if (debug) { log("YaraSnippetCompletionItemProvider: Generating 'strings' snippet"); }
    const tabs = '\t'.repeat(numTabs);
    snippet.appendText(`${tabs}strings:\n`);
    snippet.appendText(`${tabs}\t`);
    snippet.appendPlaceholder('name');
    snippet.appendText(' = ');
    // TODO: Find a way to mix choices and placeholders, so user can just hit TAB to replace the value
    snippet.appendChoice(['"string"', '/regex/', '{ HEX }']);
    return snippet;
}

export class YaraSnippetCompletionItemProvider implements vscode.CompletionItemProvider {
    private generateBasicItems(): vscode.CompletionList {
        const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(configName);
        const items: vscode.CompletionList = new vscode.CompletionList();
        if (config.get('snippets.condition')) {
            const conditionItem: vscode.CompletionItem = new vscode.CompletionItem('condition', vscode.CompletionItemKind.Snippet);
            conditionItem.detail = 'Generate a \'condition\' section (YARA)';
            conditionItem.insertText = new vscode.SnippetString('condition:\n\t${1:conditions}');
            conditionItem.documentation = new vscode.MarkdownString('');
            conditionItem.documentation.appendCodeblock('condition:\n\tCONDITIONS');
            items.items.push(conditionItem);
        }
        if (config.get('snippets.meta')) {
            const metaItem: vscode.CompletionItem = new vscode.CompletionItem('meta', vscode.CompletionItemKind.Snippet);
            metaItem.detail = 'Generate a \'meta\' section (YARA)';
            metaItem.insertText = new vscode.SnippetString('meta:\n\t$1 = "$2"');
            metaItem.documentation = new vscode.MarkdownString('');
            metaItem.documentation.appendCodeblock('meta:\n\tKEY = "VALUE"');
            items.items.push(metaItem);
        }
        if (config.get('snippets.rule')) {
            const ruleItem: vscode.CompletionItem = new vscode.CompletionItem('rule', vscode.CompletionItemKind.Snippet);
            ruleItem.detail = 'Generate a rule skeleton (YARA)';
            ruleItem.insertText = new vscode.SnippetString('rule ${1:$TM_FILENAME_BASE} {\n\t');
            ruleItem.documentation = new vscode.MarkdownString('');
            ruleItem.documentation.appendCodeblock('rule NAME {');
            items.items.push(ruleItem);
        }
        if (config.get('snippets.strings')) {
            const stringsItem: vscode.CompletionItem = new vscode.CompletionItem('strings', vscode.CompletionItemKind.Snippet);
            stringsItem.detail = 'Generate a \'strings\' section (YARA)';
            stringsItem.insertText = new vscode.SnippetString('strings:\n\t${1:name} = "${2:string}"');
            stringsItem.documentation = new vscode.MarkdownString('');
            stringsItem.documentation.appendCodeblock('strings:\n\tNAME = "STRING"');
            items.items.push(stringsItem);
        }
        if (debug) { log(`YaraSnippetCompletionItemProvider: Generated ${items.items.length} snippets`); }
        return items;
    }

    public provideCompletionItems(doc: vscode.TextDocument, pos: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionList> {
        return new Promise((resolve, reject) => {
            token.onCancellationRequested(() => {
                if (debug) { log('YaraSnippetCompletionItemProvider: Task cancelled!'); }
                resolve(undefined);
            });
            try {
                // TODO: Only provide sections when inside a rule
                const items: vscode.CompletionList = this.generateBasicItems();
                resolve(items);
            } catch (error) {
                log(`YaraSnippetCompletionItemProvider error: ${error}`);
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
                    log(`Unrecognizable snippet: ${item.label} => ${JSON.stringify(item)}`);
                    break;
            }
            item.insertText = snippet;
            item.documentation = new vscode.MarkdownString('');
            if (snippet instanceof vscode.SnippetString) {
                item.documentation.appendCodeblock(snippet.value.trim(), 'yara');
            }
            else {
                item.documentation.appendCodeblock(snippet.trim(), 'yara');
            }
            resolve(item);
        });
    }
}
