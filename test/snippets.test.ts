/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict';

import vscode = require('vscode');
import * as assert from 'assert';
import { getWorkspacePath } from './helpers';

const configName = 'yara';
const extensionId = 'infosec-intern.yara';
let extension: vscode.Extension<any>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function setTestConfig(id:string, value: any, configuration: vscode.WorkspaceConfiguration): Promise<void> {
    return configuration.update(id, value, vscode.ConfigurationTarget.Global);
}

suite('Condition Snippet', function () {
    let modifiedConfig: vscode.WorkspaceConfiguration;
    let uri: vscode.Uri;

    setup(async function () {
        extension = vscode.extensions.getExtension(extensionId);
        await extension.activate();
        modifiedConfig = vscode.workspace.getConfiguration(configName);
        uri = getWorkspacePath(extension.extensionUri, 'snippets.yar');
    });

    teardown(async function () {
        await setTestConfig('snippets.condition', undefined, modifiedConfig);
    });

    test('it does not provide a condition snippet when the setting is false', async function () {
        const pos: vscode.Position = new vscode.Position(2, 9);
        await setTestConfig('snippets.condition', false, modifiedConfig);
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 0);
        assert.equal(completions.isIncomplete, false);
        assert.equal(completions.items.length, 3);
        const item: vscode.CompletionItem = completions.items.find((value: vscode.CompletionItem) => { return value.label === 'condition'; });
        assert.equal(item, undefined);
    });

    test('it provides a basic condition section when not resolved', async function () {
        const pos: vscode.Position = new vscode.Position(5, 14);
        // don't resolve any completion items yet
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 0);
        assert.equal(completions.isIncomplete, false);
        assert.equal(completions.items.length, 4);
        const item: vscode.CompletionItem = completions.items.find((value: vscode.CompletionItem) => { return value.label === 'condition'; });
        assert.equal(item.label, 'condition');
        assert.equal(item.kind, vscode.CompletionItemKind.Snippet);
        assert.equal(item.detail, 'Generate a condition section (YARA)');
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString('condition:\n\t${1:conditions}');
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock('condition:\n\tCONDITIONS');
        assert.deepEqual(item.documentation, expectedDocs);
    });

    test('it provides a condition placeholder when resolved', async function () {
        const pos: vscode.Position = new vscode.Position(5, 14);
        // resolve items
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 4);
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items;
        assert.equal(items.length, 4);
        const item: vscode.CompletionItem = items.find((value: vscode.CompletionItem) => { return value.label === 'condition'; });
        assert.equal(item.label, 'condition');
        assert.equal(item.kind, vscode.CompletionItemKind.Snippet);
        assert.equal(item.detail, 'Generate a condition section (YARA)');
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString('condition:\n\t${1:any of them}');
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock('condition:\n\tCONDITIONS');
        assert.deepEqual(item.documentation, expectedDocs);
    });
});

suite('Metadata Snippet', function () {
    let modifiedConfig: vscode.WorkspaceConfiguration;
    let uri: vscode.Uri;

    setup(async function () {
        extension = vscode.extensions.getExtension(extensionId);
        await extension.activate();
        modifiedConfig = vscode.workspace.getConfiguration(configName);
        uri = getWorkspacePath(extension.extensionUri, 'snippets.yar');
    });

    teardown(async function () {
        await setTestConfig('metaEntries', undefined, modifiedConfig);
        await setTestConfig('sortMeta', undefined, modifiedConfig);
        await setTestConfig('snippets.meta', undefined, modifiedConfig);
    });

    test('it does not provide a meta snippet when the setting is false', async function () {
        const pos: vscode.Position = new vscode.Position(2, 9);
        await setTestConfig('snippets.meta', false, modifiedConfig);
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 0);
        assert.equal(completions.isIncomplete, false);
        assert.equal(completions.items.length, 3);
        const item: vscode.CompletionItem = completions.items.find((value: vscode.CompletionItem) => { return value.label === 'meta'; });
        assert.equal(item, undefined);
    });

    test('it provides a basic meta section when the user types in the correct prefix', async function () {
        const pos: vscode.Position = new vscode.Position(2, 9);
        // don't resolve any completion items yet
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 0);
        assert.equal(completions.isIncomplete, false);
        assert.equal(completions.items.length, 4);
        const item: vscode.CompletionItem = completions.items.find((value: vscode.CompletionItem) => { return value.label === 'meta'; });
        assert.equal(item.label, 'meta');
        assert.equal(item.kind, vscode.CompletionItemKind.Snippet);
        assert.equal(item.detail, 'Generate a meta section (YARA)');
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString('meta:\n\t$1 = "$2"');
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock('meta:\n\tkey = "value"');
        assert.deepEqual(item.documentation, expectedDocs);
    });

    test('it provides an empty meta section when no configuration is present', async function () {
        const pos: vscode.Position = new vscode.Position(2, 9);
        // the editor will merge Object configurations rather than implicitly overwriting them
        // ... so the only way to clear the config is manually undefining them
        await setTestConfig('metaEntries', undefined, modifiedConfig);
        // don't resolve any completion items yet
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 4);
        assert.equal(completions.isIncomplete, false);
        assert.equal(completions.items.length, 4);
        const item: vscode.CompletionItem = completions.items.find((value: vscode.CompletionItem) => { return value.label === 'meta'; });
        assert.equal(item.label, 'meta');
        assert.equal(item.kind, vscode.CompletionItemKind.Snippet);
        assert.equal(item.detail, 'Generate a meta section (YARA)');
        const rawInsertText = 'meta:\n\t${1:KEY} = ${2:"VALUE"}';
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString(rawInsertText);
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock(rawInsertText);
        assert.deepEqual(item.documentation, expectedDocs);
    });

    test('it provides a full meta section when a configuration is present', async function () {
        const pos: vscode.Position = new vscode.Position(2, 9);
        const testConfig: Record<string,string> = {'author': 'test user', 'hash': ''};
        await setTestConfig('metaEntries', testConfig, modifiedConfig);
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 4);
        assert.equal(completions.isIncomplete, false);
        assert.equal(completions.items.length, 4);
        const item: vscode.CompletionItem = completions.items.find((value: vscode.CompletionItem) => { return value.label === 'meta'; });
        assert.equal(item.label, 'meta');
        assert.equal(item.kind, vscode.CompletionItemKind.Snippet);
        assert.equal(item.detail, 'Generate a meta section (YARA)');
        const rawInsertText = `meta:\n\tauthor = "${testConfig['author']}"\n\thash = "$1"`;
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString(rawInsertText);
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock(rawInsertText);
        assert.deepEqual(item.documentation, expectedDocs);
    });

    test('it provides tabstops when empty configuration values are present', async function () {
        const pos: vscode.Position = new vscode.Position(2, 9);
        const testConfig: Record<string,string> = {'author': ''};
        await setTestConfig('metaEntries', testConfig, modifiedConfig);
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 4);
        assert.equal(completions.isIncomplete, false);
        assert.equal(completions.items.length, 4);
        const item: vscode.CompletionItem = completions.items.find((value: vscode.CompletionItem) => { return value.label === 'meta'; });
        assert.equal(item.label, 'meta');
        assert.equal(item.kind, vscode.CompletionItemKind.Snippet);
        assert.equal(item.detail, 'Generate a meta section (YARA)');
        const rawInsertText = `meta:\n\tauthor = "$1"`;
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString(rawInsertText);
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock(rawInsertText);
        assert.deepEqual(item.documentation, expectedDocs);
    });

    test.skip('it provides support for snippet variables', async function () {
        const pos: vscode.Position = new vscode.Position(2, 9);
        const testConfig: Record<string,string> = {'filename': '${TM_FILENAME}'};
        await setTestConfig('metaEntries', testConfig, modifiedConfig);
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 4);
        assert.equal(completions.isIncomplete, false);
        assert.equal(completions.items.length, 4);
        const item: vscode.CompletionItem = completions.items.find((value: vscode.CompletionItem) => { return value.label === 'meta'; });
        assert.equal(item.label, 'meta');
        assert.equal(item.kind, vscode.CompletionItemKind.Snippet);
        assert.equal(item.detail, 'Generate a meta section (YARA)');
        const rawInsertText = `meta:\n\tfilename = "snippets.yar"`;
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString(rawInsertText);
        // TODO: Figure out how to resolve the variable in insertText, since VSCode only does it when the snippet has been chosen
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock(rawInsertText);
        assert.deepEqual(item.documentation, expectedDocs);
    });

    test('it does not provide entries with empty configuration keys', async function () {
        const pos: vscode.Position = new vscode.Position(2, 9);
        const testConfig: Record<string,string> = {'author': '', '': 'This should not show up'};
        await setTestConfig('metaEntries', testConfig, modifiedConfig);
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 4);
        assert.equal(completions.isIncomplete, false);
        assert.equal(completions.items.length, 4);
        const item: vscode.CompletionItem = completions.items.find((value: vscode.CompletionItem) => { return value.label === 'meta'; });
        assert.equal(item.label, 'meta');
        assert.equal(item.kind, vscode.CompletionItemKind.Snippet);
        assert.equal(item.detail, 'Generate a meta section (YARA)');
        const rawInsertText = `meta:\n\tauthor = "$1"`;
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString(rawInsertText);
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock(rawInsertText);
        assert.deepEqual(item.documentation, expectedDocs);
    });

    test('it sorts the metadata keys when sort_meta is set to true', async function () {
        const pos: vscode.Position = new vscode.Position(2, 9);
        const testConfig: Record<string,string> = {'c': 'third', 'a': 'first', 'd': 'fourth', 'b': 'second'};
        await setTestConfig('metaEntries', testConfig, modifiedConfig);
        await setTestConfig('sortMeta', true, modifiedConfig);
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 4);
        assert.equal(completions.isIncomplete, false);
        assert.equal(completions.items.length, 4);
        const item: vscode.CompletionItem = completions.items.find((value: vscode.CompletionItem) => { return value.label === 'meta'; });
        assert.equal(item.label, 'meta');
        assert.equal(item.kind, vscode.CompletionItemKind.Snippet);
        assert.equal(item.detail, 'Generate a meta section (YARA)');
        const rawInsertText = `meta:\n\ta = "first"\n\tb = "second"\n\tc = "third"\n\td = "fourth"`;
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString(rawInsertText);
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock(rawInsertText);
        assert.deepEqual(item.documentation, expectedDocs);
    });

    test('it does not sort metadata keys when sort_meta is set to false', async function () {
        const pos: vscode.Position = new vscode.Position(2, 9);
        const testConfig: Record<string,string> = {'c': 'third', 'a': 'first', 'd': 'fourth', 'b': 'second'};
        await setTestConfig('metaEntries', testConfig, modifiedConfig);
        await setTestConfig('sortMeta', false, modifiedConfig);
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 4);
        assert.equal(completions.isIncomplete, false);
        assert.equal(completions.items.length, 4);
        const item: vscode.CompletionItem = completions.items.find((value: vscode.CompletionItem) => { return value.label === 'meta'; });
        assert.equal(item.label, 'meta');
        assert.equal(item.kind, vscode.CompletionItemKind.Snippet);
        assert.equal(item.detail, 'Generate a meta section (YARA)');
        const rawInsertText = `meta:\n\tc = "third"\n\ta = "first"\n\td = "fourth"\n\tb = "second"`;
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString(rawInsertText);
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock(rawInsertText);
        assert.deepEqual(item.documentation, expectedDocs);
    });
});

suite('Rule Snippet', function () {
    let modifiedConfig: vscode.WorkspaceConfiguration;
    let uri: vscode.Uri;

    setup(async function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        extension = vscode.extensions.getExtension(extensionId);
        await extension.activate();
        modifiedConfig = vscode.workspace.getConfiguration(configName);
        uri = getWorkspacePath(extension.extensionUri, 'snippets.yar');
    });

    teardown(async function () {
        await setTestConfig('snippets.rule', undefined, modifiedConfig);
    });

    test('it does not provide a rule snippet when the setting is false', async function () {
        const pos: vscode.Position = new vscode.Position(2, 9);
        await setTestConfig('snippets.rule', false, modifiedConfig);
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 0);
        assert.equal(completions.isIncomplete, false);
        assert.equal(completions.items.length, 3);
        const item: vscode.CompletionItem = completions.items.find((value: vscode.CompletionItem) => { return value.label === 'rule'; });
        assert.equal(item, undefined);
    });

    test('it provides a basic rule skeleton when not resolved', async function () {
        const pos: vscode.Position = new vscode.Position(0, 4);
        // don't resolve any completion items yet
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 0);
        assert.equal(completions.isIncomplete, false);
        const item: vscode.CompletionItem = completions.items.find((value: vscode.CompletionItem) => { return value.label === 'rule'; });
        assert.equal(item.label, 'rule');
        assert.equal(item.kind, vscode.CompletionItemKind.Snippet);
        assert.equal(item.detail, 'Generate a rule skeleton (YARA)');
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString('rule ${1:$TM_FILENAME_BASE} {\n\t');
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock('rule NAME {');
        assert.deepEqual(item.documentation, expectedDocs);
    });

    test('it provides all sections when resolved', async function () {
        const pos: vscode.Position = new vscode.Position(0, 4);
        await setTestConfig('metaEntries', {'author': '', 'date': '${CURRENT_YEAR}-${CURRENT_MONTH}-${CURRENT_DATE}'}, modifiedConfig);
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 4);
        assert.equal(completions.isIncomplete, false);
        const item: vscode.CompletionItem = completions.items.find((value: vscode.CompletionItem) => { return value.label === 'rule'; });
        assert.equal(item.label, 'rule');
        assert.equal(item.kind, vscode.CompletionItemKind.Snippet);
        assert.equal(item.detail, 'Generate a rule skeleton (YARA)');
        const rawSnippetText: string = [
            'rule ${1:my_rule} {',
            '\tmeta:',
            '\t\tauthor = "$2"',
            '\t\tdate = "${CURRENT_YEAR}-${CURRENT_MONTH}-${CURRENT_DATE}"',
            '\tstrings:',
            '\t\t${3:name} = ${4|"string",/regex/,{ HEX \\}|}',
            '\tcondition:',
            '\t\t${5:any of them}',
            '\\}',
            ''
        ].join('\n');
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString(rawSnippetText);
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock(rawSnippetText);
        assert.deepEqual(item.documentation, expectedDocs);
    });
});

suite('Strings Snippet', function () {
    let modifiedConfig: vscode.WorkspaceConfiguration;
    let uri: vscode.Uri;

    setup(async function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        extension = vscode.extensions.getExtension(extensionId);
        await extension.activate();
        modifiedConfig = vscode.workspace.getConfiguration(configName);
        uri = getWorkspacePath(extension.extensionUri, 'snippets.yar');
    });

    teardown(async function () {
        await setTestConfig('snippets.strings', undefined, modifiedConfig);
    });

    test('it does not provide a strings snippet when the setting is false', async function () {
        const pos: vscode.Position = new vscode.Position(2, 9);
        await setTestConfig('snippets.strings', false, modifiedConfig);
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 0);
        assert.equal(completions.isIncomplete, false);
        assert.equal(completions.items.length, 3);
        const item: vscode.CompletionItem = completions.items.find((value: vscode.CompletionItem) => { return value.label === 'strings'; });
        assert.equal(item, undefined);
    });

    test('it provides a basic strings section when not resolved', async function () {
        const pos: vscode.Position = new vscode.Position(3, 12);
        // don't resolve any completion items yet
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 0);
        assert.equal(completions.isIncomplete, false);
        assert.equal(completions.items.length, 4);
        const item: vscode.CompletionItem = completions.items.find((value: vscode.CompletionItem) => { return value.label === 'strings'; });
        assert.equal(item.label, 'strings');
        assert.equal(item.kind, vscode.CompletionItemKind.Snippet);
        assert.equal(item.detail, 'Generate a strings section (YARA)');
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString('strings:\n\t${1:name} = "${2:string}"');
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock('strings:\n\tNAME = "STRING"');
        assert.deepEqual(item.documentation, expectedDocs);
    });

    test('it provides a choice of strings when resolved', async function () {
        const pos: vscode.Position = new vscode.Position(3, 12);
        // don't resolve any completion items yet
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 4);
        assert.equal(completions.isIncomplete, false);
        assert.equal(completions.items.length, 4);
        const item: vscode.CompletionItem = completions.items.find((value: vscode.CompletionItem) => { return value.label === 'strings'; });
        assert.equal(item.label, 'strings');
        assert.equal(item.kind, vscode.CompletionItemKind.Snippet);
        assert.equal(item.detail, 'Generate a strings section (YARA)');
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString('strings:\n\t${1:name} = ${2|"string",/regex/,{ HEX \\}|}');
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock('strings:\n\tNAME = "STRING"');
        assert.deepEqual(item.documentation, expectedDocs);
    });
});
