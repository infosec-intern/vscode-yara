'use strict';

import vscode = require('vscode');
import * as assert from 'assert';
import { getWorkspacePath } from './helpers';

const extensionId = 'infosec-intern.yara';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let extension: vscode.Extension<any>;

suite("YARA: Provider", function () {
    let uri: vscode.Uri;

    setup(async function () {
        extension = vscode.extensions.getExtension(extensionId);
        await extension.activate();
        uri = getWorkspacePath(extension.extensionUri, 'peek_rules.yara');
    });

    test("rule definition", function (done) {
        // SyntaxExample: Line 43, Col 14
        // line numbers start at 0, so we have to subtract one for the lookup
        const pos: vscode.Position = new vscode.Position(42, 14);
        vscode.commands.executeCommand("vscode.executeDefinitionProvider", uri, pos).then((definitions: vscode.Location[]) => {
                assert.equal(definitions.length, 1);
                definitions.forEach((definition: vscode.Location) => {
                    assert.equal(definition.uri.fsPath, uri.fsPath);
                    assert.equal(definition.range.start.line, 5);
                    assert.equal(definition.range.start.character, 5);
                });
                done();
            });
    });

    test("variable definition", function (done) {
        // $hex_string: Line 25, Col 14
        // line numbers start at 0, so we have to subtract one for the lookup
        const pos: vscode.Position = new vscode.Position(24, 14);
        vscode.commands.executeCommand("vscode.executeDefinitionProvider", uri, pos).then((definitions: vscode.Location[]) => {
            assert.equal(definitions.length, 1);
            definitions.forEach((definition: vscode.Location) => {
                assert.equal(definition.uri.fsPath, uri.fsPath);
                assert.equal(definition.range.start.line, 19);
                assert.equal(definition.range.start.character, 9);
            });
            done();
        });
    });

    test("symbol references", function (done) {
        // $dstring: Line 22, Col 11
        const pos: vscode.Position = new vscode.Position(21, 11);
        const acceptableLines: Set<number> = new Set([21, 28, 29]);
        vscode.commands.executeCommand("vscode.executeReferenceProvider", uri, pos).then((references: vscode.Location[]) => {
            assert.equal(references.length, 3);
            references.forEach((reference: vscode.Location) => {
                assert.equal(reference.uri.fsPath, uri.fsPath);
                assert.ok(reference.range.isSingleLine);
                assert.ok(acceptableLines.has(reference.range.start.line));
                assert.equal(reference.range.start.character, 9);
            });
            done();
        });
    });

    test("wildcard references", function (done) {
        // $hex_*: Line 31, Col 11
        const pos: vscode.Position = new vscode.Position(30, 11);
        const acceptableLines: Set<number> = new Set([19, 20, 24]);
        vscode.commands.executeCommand("vscode.executeReferenceProvider", uri, pos).then((references: vscode.Location[]) => {
            assert.equal(references.length, 3);
            references.forEach((reference: vscode.Location) => {
                assert.equal(reference.uri.fsPath, uri.fsPath);
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
        // $hex_string: Line 20, Col 11
        const pos: vscode.Position = new vscode.Position(19, 11);
        const acceptableLines: Set<number> = new Set([19, 24, 40, 42]);
        vscode.commands.executeCommand("vscode.executeReferenceProvider", uri, pos).then((references: vscode.Location[]) => {
            assert.equal(references.length, 4);
            references.forEach((reference: vscode.Location) => {
                assert.equal(reference.uri.fsPath, uri.fsPath);
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
        const gotoUri: vscode.Uri = getWorkspacePath(extension.extensionUri, 'private_rule_goto.yara');
        // my_private_rule: Line 10, Col 14
        const pos: vscode.Position = new vscode.Position(9, 14);
        vscode.commands.executeCommand("vscode.executeDefinitionProvider", gotoUri, pos).then((references: vscode.Location[]) => {
            assert.equal(references.length, 1);
            references.forEach((reference: vscode.Location) => {
                assert.equal(reference.uri.fsPath, gotoUri.fsPath);
                assert.ok(reference.range.isSingleLine);
                assert.equal(reference.range.start.line, 0);
                assert.equal(reference.range.start.character, 13);
            });
            done();
        });
   });
});
