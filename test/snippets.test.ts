'use strict';
import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

const extensionId = 'infosec-intern.yara';
const workspace = path.join(__dirname, '..', '..', 'test', 'rules');


suite('Condition Snippet', function () {
    setup(async function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extension: vscode.Extension<any> = vscode.extensions.getExtension(extensionId);
        await extension.activate();
    });

    test('it provides a basic condition section when not resolved', async function () {
        const filepath: string = path.join(workspace, 'snippets.yar');
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(5, 14);
        // don't resolve any completion items yet
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 0);
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items;
        assert.equal(items.length, 4);
        const item: vscode.CompletionItem = items.find((value: vscode.CompletionItem) => { return value.label === 'condition'; });
        assert.equal(item.label, 'condition');
        assert.equal(item.kind, vscode.CompletionItemKind.Snippet);
        assert.equal(item.detail, 'Generate a \'condition\' section (YARA)');
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString('condition:\n\t${1:conditions}');
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock('condition:\n\tCONDITIONS');
        assert.deepEqual(item.documentation, expectedDocs);
    });

    test('it provides a condition placeholder when resolved', async function () {
        const filepath: string = path.join(workspace, 'snippets.yar');
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(5, 14);
        // resolve items
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 4);
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items;
        assert.equal(items.length, 4);
        const item: vscode.CompletionItem = items.find((value: vscode.CompletionItem) => { return value.label === 'condition'; });
        assert.equal(item.label, 'condition');
        assert.equal(item.kind, vscode.CompletionItemKind.Snippet);
        assert.equal(item.detail, 'Generate a \'condition\' section (YARA)');
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString('condition:\n\t${1:any of them}');
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock('condition:\n\tCONDITIONS');
        assert.deepEqual(item.documentation, expectedDocs);
    });
});

suite('Metadata Snippet', function () {
    setup(async function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extension: vscode.Extension<any> = vscode.extensions.getExtension(extensionId);
        await extension.activate();
    });

    test('it provides a basic meta section when the user types in the correct prefix', async function () {
        const filepath: string = path.join(workspace, 'snippets.yar');
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(2, 9);
        // don't resolve any completion items yet
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 0);
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items;
        assert.equal(items.length, 4);
        const item: vscode.CompletionItem = items.find((value: vscode.CompletionItem) => { return value.label === 'meta'; });
        assert.equal(item.label, 'meta');
        assert.equal(item.kind, vscode.CompletionItemKind.Snippet);
        assert.equal(item.detail, 'Generate a \'meta\' section (YARA)');
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString('meta:\n\t$1 = "$2"');
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock('meta:\n\tkey = "value"');
        assert.deepEqual(item.documentation, expectedDocs);
    });

    test.skip('it provides an empty meta section when no configuration is present', async function () {
        assert.ok(false);
    });

    test.skip('it provides a full meta section when a configuration is present', async function () {
        assert.ok(false);
    });

    test.skip('it provides tabstops when empty configuration values are present', async function () {
        assert.ok(false);
    });

    test.skip('it provides support for snippet variables', async function () {
        assert.ok(false);
    });

    test.skip('it does not provide entries with empty configuration keys', async function () {
        assert.ok(false);
    });

    test.skip('it does not provide a meta section without the user typing the correct prefix', async function () {
        assert.ok(false);
    });

    test.skip('it sorts the metadata keys when sort_meta is set to true', async function () {
        assert.ok(false);
    });

    test.skip('it does not sort metadata keys when sort_meta is set to false', async function () {
        assert.ok(false);
    });
});

suite('Rule Snippet', function () {
    setup(async function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extension: vscode.Extension<any> = vscode.extensions.getExtension(extensionId);
        await extension.activate();
    });

    test('it provides a basic rule skeleton when not resolved', async function () {
        const filepath: string = path.join(workspace, 'snippets.yar');
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(0, 5);
        // don't resolve any completion items yet
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 0);
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items;
        assert.equal(items.length, 4);
        const item: vscode.CompletionItem = items.find((value: vscode.CompletionItem) => { return value.label === 'rule'; });
        assert.equal(item.label, 'rule');
        assert.equal(item.kind, vscode.CompletionItemKind.Snippet);
        assert.equal(item.detail, 'Generate a rule skeleton (YARA)');
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString('rule ${1:$TM_FILENAME_BASE} {\n\t');
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock('rule NAME {');
        assert.deepEqual(item.documentation, expectedDocs);
    });

    test.skip('it provides all sections when resolved', async function () {
        assert.ok(false);
    });
});

suite('Strings Snippet', function () {
    setup(async function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extension: vscode.Extension<any> = vscode.extensions.getExtension(extensionId);
        await extension.activate();
    });

    test('it provides a basic strings section when not resolved', async function () {
        const filepath: string = path.join(workspace, 'snippets.yar');
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(3, 12);
        // don't resolve any completion items yet
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 0);
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items;
        assert.equal(items.length, 4);
        const item: vscode.CompletionItem = items.find((value: vscode.CompletionItem) => { return value.label === 'strings'; });
        assert.equal(item.label, 'strings');
        assert.equal(item.kind, vscode.CompletionItemKind.Snippet);
        assert.equal(item.detail, 'Generate a \'strings\' section (YARA)');
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString('strings:\n\t${1:name} = "${2:string}"');
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock('strings:\n\tNAME = "STRING"');
        assert.deepEqual(item.documentation, expectedDocs);
    });

    test('it provides a choice of strings when resolved', async function () {
        const filepath: string = path.join(workspace, 'snippets.yar');
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(3, 12);
        // don't resolve any completion items yet
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 4);
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items;
        assert.equal(items.length, 4);
        const item: vscode.CompletionItem = items.find((value: vscode.CompletionItem) => { return value.label === 'strings'; });
        assert.equal(item.label, 'strings');
        assert.equal(item.kind, vscode.CompletionItemKind.Snippet);
        assert.equal(item.detail, 'Generate a \'strings\' section (YARA)');
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString('strings:\n\t${1:name} = ${2|"string",/regex/,{ HEX \\}|}');
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock('strings:\n\tNAME = "STRING"');
        assert.deepEqual(item.documentation, expectedDocs);
    });
});
