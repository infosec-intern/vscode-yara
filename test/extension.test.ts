'use strict';
import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

const extensionId = 'infosec-intern.yara';
const workspace = path.join(__dirname, '..', '..', 'test', 'rules');

suite("YARA: Provider", function () {
    setup(async function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extension: vscode.Extension<any> = vscode.extensions.getExtension("infosec-intern.yara");
        await extension.activate();
    });

    test("rule definition", function (done) {
        const filepath: string = path.join(workspace, "peek_rules.yara");
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        // SyntaxExample: Line 43, Col 14
        // line numbers start at 0, so we have to subtract one for the lookup
        const pos: vscode.Position = new vscode.Position(42, 14);
        vscode.commands.executeCommand("vscode.executeDefinitionProvider", uri, pos).then((definitions: vscode.Location[]) => {
                // console.log(`rule definitions: ${JSON.stringify(definitions)}`);
                assert.equal(definitions.length, 1);
                definitions.forEach((definition: vscode.Location) => {
                    assert.equal(definition.uri.fsPath, filepath);
                    assert.equal(definition.range.start.line, 5);
                    assert.equal(definition.range.start.character, 5);
                });
                done();
            });
    });

    test("variable definition", function (done) {
        const filepath: string = path.join(workspace, "peek_rules.yara");
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        // $hex_string: Line 25, Col 14
        // line numbers start at 0, so we have to subtract one for the lookup
        const pos: vscode.Position = new vscode.Position(24, 14);
        vscode.commands.executeCommand("vscode.executeDefinitionProvider", uri, pos).then((definitions: vscode.Location[]) => {
            // console.log(`variable definitions: ${JSON.stringify(definitions)}`);
            assert.equal(definitions.length, 1);
            definitions.forEach((definition: vscode.Location) => {
                assert.equal(definition.uri.fsPath, filepath);
                assert.equal(definition.range.start.line, 19);
                assert.equal(definition.range.start.character, 9);
            });
            done();
        });
    });

    test("symbol references", function (done) {
        const filepath: string = path.join(workspace, "peek_rules.yara");
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        // $dstring: Line 22, Col 11
        const pos: vscode.Position = new vscode.Position(21, 11);
        const acceptableLines: Set<number> = new Set([21, 28, 29]);
        vscode.commands.executeCommand("vscode.executeReferenceProvider", uri, pos).then((references: vscode.Location[]) => {
            // console.log(`symbol references: ${JSON.stringify(references)}`);
            assert.equal(references.length, 3);
            references.forEach((reference: vscode.Location) => {
                assert.equal(reference.uri.fsPath, filepath);
                assert.ok(reference.range.isSingleLine);
                assert.ok(acceptableLines.has(reference.range.start.line));
                assert.equal(reference.range.start.character, 9);
            });
            done();
        });
    });

    test("wildcard references", function (done) {
        const filepath: string = path.join(workspace, "peek_rules.yara");
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        // $hex_*: Line 31, Col 11
        const pos: vscode.Position = new vscode.Position(30, 11);
        const acceptableLines: Set<number> = new Set([19, 20, 24]);
        vscode.commands.executeCommand("vscode.executeReferenceProvider", uri, pos).then((references: vscode.Location[]) => {
            // console.log(`wildcard references: ${JSON.stringify(references)}`);
            assert.equal(references.length, 3);
            references.forEach((reference: vscode.Location) => {
                assert.equal(reference.uri.fsPath, filepath);
                assert.ok(reference.range.isSingleLine);
                assert.ok(acceptableLines.has(reference.range.start.line));
                assert.equal(reference.range.start.character, 9);
            });
            done();
        });
    });

    /*
        Trying to capture $hex_string but not $hex_string2
        Should collect references for:
            $hex_string = { E2 34 ?? C8 A? FB [2-4] }
            $hex_string
        But not:
            $hex_string2 = { F4 23 ( 62 B4 | 56 ) 45 }
    */
    test("issue #17", function (done) {
        const filepath: string = path.join(workspace, "peek_rules.yara");
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        // $hex_string: Line 20, Col 11
        const pos: vscode.Position = new vscode.Position(19, 11);
        const acceptableLines: Set<number> = new Set([19, 24, 40, 42]);
        vscode.commands.executeCommand("vscode.executeReferenceProvider", uri, pos).then((references: vscode.Location[]) => {
            // console.log(`issue 17: ${JSON.stringify(references)}`);
            assert.equal(references.length, 4);
            references.forEach((reference: vscode.Location) => {
                assert.equal(reference.uri.fsPath, filepath);
                assert.ok(reference.range.isSingleLine);
                assert.ok(acceptableLines.has(reference.range.start.line));
                if (reference.range.start.line == 42) {
                    // "SyntaxExample and $hex_string"
                    assert.equal(reference.range.start.character, 27);
                }
                else {
                    assert.equal(reference.range.start.character, 9);
                }
            });
            done();
        });
    });

    /*
        Trying to capture definitions for private rules
        Should align symbol `my_private_rule` with definition started by `private rule my_private_rule`
    */
   test("issue #32", function (done) {
        const filepath: string = path.join(workspace, "private_rule_goto.yara");
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        // my_private_rule: Line 10, Col 14
        const pos: vscode.Position = new vscode.Position(9, 14);
        vscode.commands.executeCommand("vscode.executeDefinitionProvider", uri, pos).then((references: vscode.Location[]) => {
            // console.log(`issue 32: ${JSON.stringify(references)}`);
            assert.equal(references.length, 1);
            references.forEach((reference: vscode.Location) => {
                assert.equal(reference.uri.fsPath, filepath);
                assert.ok(reference.range.isSingleLine);
                assert.equal(reference.range.start.line, 0);
                assert.equal(reference.range.start.character, 13);
            });
            done();
        });
   });
});

suite("Code Completion", function () {
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
        const items: Array<vscode.CompletionItem> = completions.items;
        assert.equal(items.length, 1);
        assert.ok(items[0].label === "time.now" && items[0].kind === vscode.CompletionItemKind.Method);
    });

    test("it provides the second level of labels with module + first level", async function () {
        const filepath: string = path.join(workspace, "code_completion.yara");
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(13, 24);   // cuckoo.network.
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, '.');
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items;
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
            // ... so filter these out first
            return item.kind !== vscode.CompletionItemKind.Text;
        });
        assert.equal(providerItems.length, 0);
    });

    test("it provides an Enum kind when the JSON specifies an enum", async function () {
        const filepath: string = path.join(workspace, "code_completion.yara");
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(15, 25);   // pe.AGGRESIVE_WS_
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, '.');
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items;
        assert.equal(items.length, 1);
        assert.ok(items[0].label === "pe.AGGRESIVE_WS_TRIM" && items[0].kind === vscode.CompletionItemKind.Enum);
    });

    test("it provides a Property kind when the JSON specifies a property", async function () {
        const filepath: string = path.join(workspace, "code_completion.yara");
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(16, 21);   // pe.character
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, '.');
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items;
        assert.equal(items.length, 1);
        assert.equal(items[0].label, "pe.characteristics");
        assert.equal(items[0].kind, vscode.CompletionItemKind.Property);
        assert.equal(items[0].insertText, "characteristics");
    });

    test("it provides a Struct kind when the JSON specifies a dictionary", async function () {
        const filepath: string = path.join(workspace, "code_completion.yara");
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(17, 22);   // pe.version_in
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, '.');
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items;
        assert.equal(items.length, 1);
        assert.equal(items[0].label, "pe.version_info")
        assert.equal(items[0].kind, vscode.CompletionItemKind.Struct);
        assert.equal(items[0].detail, "pe.version_info[\"key\"]");
        assert.deepEqual(items[0].insertText, new vscode.SnippetString('version_info["${1:key}"]'))
    });

    test("it provides a Unit kind when the JSON specifies a list", async function () {
        const filepath: string = path.join(workspace, "code_completion.yara");
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(18, 21);   // dotnet.guids
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, '.');
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items;
        assert.equal(items.length, 1);
        assert.equal(items[0].label, "dotnet.guids");
        assert.equal(items[0].kind, vscode.CompletionItemKind.Unit);
        assert.equal(items[0].detail, "dotnet.guids[i]");
        assert.deepEqual(items[0].insertText, new vscode.SnippetString('guids[${1:i}]'));
    });

    test("it provides sub fields when the JSON specifies a list of objects", async function () {
        const filepath: string = path.join(workspace, "code_completion.yara");
        const uri: vscode.Uri = vscode.Uri.file(filepath);
        const pos: vscode.Position = new vscode.Position(19, 25);   // pe.data_director
        const completions: vscode.CompletionList = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', uri, pos, '.');
        assert.equal(completions.isIncomplete, false);
        const items: Array<vscode.CompletionItem> = completions.items;
        assert.equal(items.length, 2);
        assert.equal(items[0].label, "pe.data_directories[i].size");
        assert.equal(items[0].kind, vscode.CompletionItemKind.Property);
        assert.equal(items[1].label, "pe.data_directories[i].virtual_address");
        assert.equal(items[1].kind, vscode.CompletionItemKind.Property);
    });
});
