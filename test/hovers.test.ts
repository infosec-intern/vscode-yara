'use strict';
import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import { YaraHexStringHoverProvider } from '../yara/src/common/hoverProvider';

const extensionId = 'infosec-intern.yara';
const workspace = path.join(__dirname, '..', '..', 'test', 'rules');

suite("Hex String Hovers", function () {
    const filepath: string = path.join(workspace, "hex_strings.yar");
    const uri: vscode.Uri = vscode.Uri.file(filepath);

    setup(async function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extension: vscode.Extension<any> = vscode.extensions.getExtension(extensionId);
        await extension.activate();
    });

    test("it provides a hover for simple hex strings", async function () {
        const expectedRange = new vscode.Range(
            new vscode.Position(8, 14),
            new vscode.Position(8, 46)
        );
        const pos: vscode.Position = new vscode.Position(8, 17);    // {6A 40 68 00 30 00 00 6A 14 8D 91}
        const hovers: Array<vscode.Hover> = await vscode.commands.executeCommand('vscode.executeHoverProvider', uri, pos);
        assert.equal(hovers.length, 1);
        assert.deepEqual(hovers[0].range, expectedRange);
    });

    test("it does provides a warning for hex strings missing a closed parentheses", async function () {
        const expectedRange: vscode.Range = new vscode.Range(
            new vscode.Position(55, 34),
            new vscode.Position(55, 69)
        );
        const pos: vscode.Position = new vscode.Position(55, 40);    // { F4 23 ( 62 B4 | 56 | 45 ?? 67  45 }
        const hovers: Array<vscode.Hover> = await vscode.commands.executeCommand('vscode.executeHoverProvider', uri, pos);
        assert.equal(hovers.length, 1);
        assert.deepEqual(hovers[0].range, expectedRange);
    });

    test("it does provides a warning for hex strings missing an open parantheses", async function () {
        const expectedRange: vscode.Range = new vscode.Range(
            new vscode.Position(56, 32),
            new vscode.Position(56, 66)
        );
        const pos: vscode.Position = new vscode.Position(56, 40);   // { F4 23 62 B4 | 56 | 45 ?? 67 ) 45 }
        const hovers: Array<vscode.Hover> = await vscode.commands.executeCommand('vscode.executeHoverProvider', uri, pos);
        assert.equal(hovers.length, 1);
        assert.deepEqual(hovers[0].range, expectedRange);
    });

    test("it does not provide a hover for non-hex strings", async function () {
        const pos: vscode.Position = new vscode.Position(16, 0);    // rule WildcardExample
        const hovers: Array<vscode.Hover> = await vscode.commands.executeCommand('vscode.executeHoverProvider', uri, pos);
        assert.equal(hovers.length, 0);
    });
});

suite("YaraHexStringHoverProvider.convertHextoChar", function () {
    const provider: YaraHexStringHoverProvider = new YaraHexStringHoverProvider();

    test("it converts a set of hex digits to ASCII characters", async function () {
        const hexString = "74 65 73 74 20 73 74 72 69 6e 67";
        const expectedText = "test string"
        const actualText: string = provider.convertHexToChar(hexString);
        assert.equal(actualText, expectedText);
    });

    test("it preserves wildcards", async function () {
        const hexString = "74 ?? 73 74 20 73 74 72 69 6e 67";
        const expectedText = "t??st string"
        const actualText: string = provider.convertHexToChar(hexString);
        assert.equal(actualText, expectedText);
    });

    test("it preserves jumps", async function () {
        const hexString = "74 65 [2-4] 73 74 72 69 6e 67"
        const expectedText = "te[2-4]string";
        const actualText: string = provider.convertHexToChar(hexString);
        assert.equal(actualText, expectedText);
    });

    test("it preserves parenthese and pipes", async function () {
        const hexString = "74 ( 65 | 61) 73 74 20 73 74 72 69 6e 67";
        const expectedText = "t(e|a)st string";
        const actualText: string = provider.convertHexToChar(hexString);
        assert.equal(actualText, expectedText);
    });
});
