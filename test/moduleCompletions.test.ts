'use strict';
import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

const extensionId = 'infosec-intern.yara';
const workspace = path.join(__dirname, '..', '..', 'test', 'rules');

suite("Module Completion", function () {
    setup(async function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extension: vscode.Extension<any> = vscode.extensions.getExtension(extensionId);
        await extension.activate();
    });

    test("it provides the first level of labels with module name", async function () {
        const filepath: string = path.join(workspace, "code_completion.yara");
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(12, 14);    // time.
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, '.');
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items.filter((item: vscode.CompletionItem) => {
            return item.kind !== vscode.CompletionItemKind.Snippet;
        });
        assert.equal(items.length, 1);
        assert.ok(items[0].label === "time.now" && items[0].kind === vscode.CompletionItemKind.Method);
    });

    test("it provides the second level of labels with module + first level", async function () {
        const filepath: string = path.join(workspace, "code_completion.yara");
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(13, 24);   // cuckoo.network.
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, '.');
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items.filter((item: vscode.CompletionItem) => {
            return item.kind !== vscode.CompletionItemKind.Snippet;
        });
        assert.equal(items.length, 8);
        assert.ok(items[0].label === "cuckoo.network.dns_lookup" && items[0].kind === vscode.CompletionItemKind.Method);
        assert.ok(items[1].label === "cuckoo.network.host" && items[1].kind === vscode.CompletionItemKind.Method);
        assert.ok(items[2].label === "cuckoo.network.http_get" && items[2].kind === vscode.CompletionItemKind.Method);
        assert.ok(items[3].label === "cuckoo.network.http_post" && items[3].kind === vscode.CompletionItemKind.Method);
        assert.ok(items[4].label === "cuckoo.network.http_request" && items[4].kind === vscode.CompletionItemKind.Method);
        assert.ok(items[5].label === "cuckoo.network.http_user_agent" && items[5].kind === vscode.CompletionItemKind.Method);
        assert.ok(items[6].label === "cuckoo.network.tcp" && items[6].kind === vscode.CompletionItemKind.Method);
        assert.ok(items[7].label === "cuckoo.network.udp" && items[7].kind === vscode.CompletionItemKind.Method);
    });

    test("it does not provide completion items for non-existent modules", async function () {
        const filepath: string = path.join(workspace, "code_completion.yara");
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(14, 16);   // foobar.
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, '.');
        assert.equal(completions.isIncomplete, false);
        const providerItems: Array<vscode.CompletionItem> = completions.items.filter((item: vscode.CompletionItem) => {
            // the extension never provides 'Text' completion items - these are only provided by the IDE
            // ... so filter these and the extension's Snippets out first
            return item.kind !== vscode.CompletionItemKind.Text && item.kind !== vscode.CompletionItemKind.Snippet;
        });
        assert.equal(providerItems.length, 0);
    });

    test("it provides an Enum kind when the JSON specifies an enum", async function () {
        const filepath: string = path.join(workspace, "code_completion.yara");
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(15, 25);   // pe.AGGRESIVE_WS_
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, '.');
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items.filter((item: vscode.CompletionItem) => {
            return item.kind !== vscode.CompletionItemKind.Snippet;
        });
        assert.equal(items.length, 1);
        assert.equal(items[0].label, "pe.AGGRESIVE_WS_TRIM")
        assert.equal(items[0].kind, vscode.CompletionItemKind.Enum);
        assert.equal(items[0].detail, undefined);
        assert.equal(items[0].insertText, "AGGRESIVE_WS_TRIM");
    });

    test("it provides a Property kind when the JSON specifies a property", async function () {
        const filepath: string = path.join(workspace, "code_completion.yara");
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(16, 21);   // pe.character
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, '.');
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items.filter((item: vscode.CompletionItem) => {
            return item.kind !== vscode.CompletionItemKind.Snippet;
        });
        assert.equal(items.length, 1);
        assert.equal(items[0].label, "pe.characteristics");
        assert.equal(items[0].kind, vscode.CompletionItemKind.Property);
        assert.equal(items[0].detail, undefined);
        assert.equal(items[0].insertText, "characteristics");
    });

    test("it provides a Struct kind when the JSON specifies a dictionary", async function () {
        const filepath: string = path.join(workspace, "code_completion.yara");
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(17, 22);   // pe.version_in
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, '.');
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items.filter((item: vscode.CompletionItem) => {
            return item.kind !== vscode.CompletionItemKind.Snippet;
        });
        const versionInfo: Array<vscode.CompletionItem> = items.filter((item: vscode.CompletionItem) => {
            return item.label == "pe.version_info";
        });
        assert.equal(versionInfo.length, 1);
        assert.equal(versionInfo[0].label, "pe.version_info")
        assert.equal(versionInfo[0].kind, vscode.CompletionItemKind.Struct);
        assert.equal(versionInfo[0].detail, "pe.version_info[\"key\"]");
        assert.deepEqual(versionInfo[0].insertText, new vscode.SnippetString('version_info["${1:key}"]'))
    });

    test("it provides a Unit kind when the JSON specifies a list", async function () {
        const filepath: string = path.join(workspace, "code_completion.yara");
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(18, 21);   // dotnet.guids
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, '.');
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items.filter((item: vscode.CompletionItem) => {
            return item.kind !== vscode.CompletionItemKind.Snippet;
        });
        assert.equal(items.length, 1);
        assert.equal(items[0].label, "dotnet.guids");
        assert.equal(items[0].kind, vscode.CompletionItemKind.Unit);
        assert.equal(items[0].detail, "dotnet.guids[index]");
        assert.deepEqual(items[0].insertText, new vscode.SnippetString('guids[${1:index}]'));
    });

    test("it provides sub fields when the JSON specifies a list of objects", async function () {
        const filepath: string = path.join(workspace, "code_completion.yara");
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(19, 25);   // pe.data_director
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, '.');
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items.filter((item: vscode.CompletionItem) => {
            return item.kind !== vscode.CompletionItemKind.Snippet;
        });
        assert.equal(items.length, 2);
        assert.equal(items[0].label, "pe.data_directories[].size");
        assert.equal(items[0].kind, vscode.CompletionItemKind.Property);
        assert.equal(items[0].detail, "pe.data_directories[index].size");
        assert.deepEqual(items[0].insertText, new vscode.SnippetString('data_directories[${1:index}].size'));
        assert.equal(items[1].label, "pe.data_directories[].virtual_address");
        assert.equal(items[1].kind, vscode.CompletionItemKind.Property);
        assert.equal(items[1].detail, "pe.data_directories[index].virtual_address");
        assert.deepEqual(items[1].insertText, new vscode.SnippetString('data_directories[${1:index}].virtual_address'));
    });
});
