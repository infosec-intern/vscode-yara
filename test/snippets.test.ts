'use strict';
import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

const extensionId = 'infosec-intern.yara';
const workspace = path.join(__dirname, '..', '..', 'test', 'rules');

suite("Snippet Provider", function () {
    setup(async function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extension: vscode.Extension<any> = vscode.extensions.getExtension(extensionId);
        await extension.activate();
    });

    test("it provides a basic meta section when the user types in the correct prefix", async function () {
        const filepath: string = path.join(workspace, 'snippets.yar');
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(2, 9);
        // don't resolve any completion items yet
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, null, 0);
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items;
        assert.equal(items.length, 1);
        const item: vscode.CompletionItem = items[0];
        assert.equal(item.label, "meta");
        assert.equal(item.detail, 'Generate a \'meta\' section (YARA)');
        assert.equal(item.filterText, undefined);
        const expectedInsertText: vscode.SnippetString = new vscode.SnippetString('meta:\n\t$1 = "$2"');
        assert.deepEqual(item.insertText, expectedInsertText);
        const expectedDocs: vscode.MarkdownString = new vscode.MarkdownString('');
        expectedDocs.appendCodeblock('meta:\n\tkey = "value"');
        assert.deepEqual(item.documentation, expectedDocs);
    });

    test.skip("it provides an empty meta section when no configuration is present", async function () {
        assert.ok(false);
    });

    test.skip("it provides a full meta section when a configuration is present", async function () {
        assert.ok(false);
    });

    test.skip("it provides tabstops when empty configuration values are present", async function () {
        assert.ok(false);
    });

    test.skip("it provides support for snippet variables", async function () {
        assert.ok(false);
    });

    test.skip("it does not provide entries with empty configuration keys", async function () {
        assert.ok(false);
    });

    test.skip("it does not provide a meta section without the user typing the correct prefix", async function () {
        assert.ok(false);
    });

    test.skip("it sorts the metadata keys when sort_meta is set to true", async function () {
        assert.ok(false);
    });

    test.skip("it does not sort metadata keys when sort_meta is set to false", async function () {
        assert.ok(false);
    });
});
