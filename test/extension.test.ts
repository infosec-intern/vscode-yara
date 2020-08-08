"use strict";

/*
Note: This example test is leveraging the Mocha test framework.
Please refer to their documentation on https://mochajs.org/ for help.
*/

import * as path from "path";
import * as vscode from "vscode";
import { YaraCompletionItemProvider } from "../yara/src/completionProvider";
import { YaraDefinitionProvider } from "../yara/src/definitionProvider";
import { YaraReferenceProvider } from "../yara/src/referenceProvider";


let workspace = path.join(__dirname, "..", "..", "test/rules/");

suite("YARA: Provider", function () {
    test("rule definition", function (done) {
        const filepath: string = path.join(workspace, "peek_rules.yara");
        vscode.workspace.openTextDocument(filepath).then(function (doc) {
            const defProvider: vscode.DefinitionProvider = new YaraDefinitionProvider();
            // SyntaxExample: Line 43, Col 14
            // line numbers start at 0, so we have to subtract one for the lookup
            let pos: vscode.Position = new vscode.Position(42, 14);
            let tokenSource: vscode.CancellationTokenSource = new vscode.CancellationTokenSource();
            let result = defProvider.provideDefinition(doc, pos, tokenSource.token);
            if (result instanceof vscode.Location) {
                let resultWordRange: vscode.Range = doc.getWordRangeAtPosition(result.range.start);
                let resultWord: string = doc.getText(resultWordRange);
                if (resultWord == "SyntaxExample") { done(); }
            }
            else if (result instanceof Array) {
                // Should only get one result, so we've failed if an Array is returned
            }
            else if (result instanceof Promise) {
                result.then(function (definition) {
                    let resultWordRange: vscode.Range = doc.getWordRangeAtPosition(definition.range.start);
                    let resultWord: string = doc.getText(resultWordRange);
                    if (resultWord == "SyntaxExample" && definition.range.start.line == 5) { done(); }
                });
            }
        });
    });

    test("variable definition", function (done) {
        const filepath: string = path.join(workspace, "peek_rules.yara");
        vscode.workspace.openTextDocument(filepath).then(function (doc) {
            const defProvider: vscode.DefinitionProvider = new YaraDefinitionProvider();
            // $hex_string: Line 25, Col 14
            // line numbers start at 0, so we have to subtract one for the lookup
            let pos: vscode.Position = new vscode.Position(24, 14);
            let tokenSource: vscode.CancellationTokenSource = new vscode.CancellationTokenSource();
            let result = defProvider.provideDefinition(doc, pos, tokenSource.token);
            if (result instanceof vscode.Location) {
                let resultWordRange: vscode.Range = doc.getWordRangeAtPosition(result.range.start);
                let resultWord: string = doc.getText(resultWordRange);
                if (resultWord == "hex_string") { done(); }
            }
            else if (result instanceof Array) {
                // Should only get one result, so we've failed if an Array is returned
            }
            else if (result instanceof Promise) {
                result.then(function (definition) {
                    let resultWordRange: vscode.Range = doc.getWordRangeAtPosition(definition.range.start);
                    let resultWord: string = doc.getText(resultWordRange);
                    if (resultWord == "hex_string") { done(); }
                });
            }
        });
    });

    test("symbol references", function (done) {
        const filepath: string = path.join(workspace, "peek_rules.yara");
        vscode.workspace.openTextDocument(filepath).then(function (doc) {
            const refProvider: vscode.ReferenceProvider = new YaraReferenceProvider();
            // $dstring: Line 22, Col 11
            let pos: vscode.Position = new vscode.Position(21, 11);
            // console.log(`search term: ${doc.getText(doc.getWordRangeAtPosition(pos))}`);
            let ctx: vscode.ReferenceContext | null = null;
            let tokenSource: vscode.CancellationTokenSource = new vscode.CancellationTokenSource();
            let results = refProvider.provideReferences(doc, pos, ctx, tokenSource.token);
            let passed: boolean = true;
            const acceptableLines: Set<number> = new Set([21, 28, 29]);
            if (results instanceof Array && results.length == 3) {
                results.forEach(reference => {
                    let refWordRange: vscode.Range = doc.getWordRangeAtPosition(reference.range.start);
                    let refWord: string = doc.getText(refWordRange);
                    if (refWord != "dstring" || !acceptableLines.has(reference.range.start.line)) { passed = false; }
                });
                if (passed) { done(); }
            }
            else if (results instanceof Promise) {
                results.then(function (references) {
                    if (references.length != 3) {
                        passed = false;
                    }
                    else {
                        references.forEach(reference => {
                            let refWordRange = doc.getWordRangeAtPosition(reference.range.start);
                            let refWord: string = doc.getText(refWordRange);
                            if (refWord != "dstring" || !acceptableLines.has(reference.range.start.line)) { passed = false; }
                        });
                        if (passed) { done(); }
                    }
                });
            }
        });
    });

    test("wildcard references", function (done) {
        const filepath: string = path.join(workspace, "peek_rules.yara");
        vscode.workspace.openTextDocument(filepath).then(function (doc) {
            const refProvider: vscode.ReferenceProvider = new YaraReferenceProvider();
            // $hex_*: Line 31, Col 11
            let pos: vscode.Position = new vscode.Position(30, 11);
            // console.log(`search term: ${doc.getText(doc.getWordRangeAtPosition(pos))}`);
            let ctx: vscode.ReferenceContext | null = null;
            let tokenSource: vscode.CancellationTokenSource = new vscode.CancellationTokenSource();
            let results = refProvider.provideReferences(doc, pos, ctx, tokenSource.token);
            let passed: boolean = true;
            const acceptableLines: Set<number> = new Set([19, 20, 24]);
            if (results instanceof Array && results.length == 3) {
                results.forEach(reference => {
                    let refWordRange: vscode.Range = doc.getWordRangeAtPosition(reference.range.start);
                    let refWord: string = doc.getText(refWordRange);
                    if (!acceptableLines.has(reference.range.start.line)) { passed = false; }
                });
                if (passed) { done(); }
            }
            else if (results instanceof Promise) {
                results.then(function (references) {
                    if (references.length != 3) {
                        passed = false;
                    }
                    else {
                        references.forEach(reference => {
                            let refWordRange = doc.getWordRangeAtPosition(reference.range.start);
                            let refWord: string = doc.getText(refWordRange);
                            if (!acceptableLines.has(reference.range.start.line)) { passed = false; }
                        });
                        if (passed) { done(); }
                    }
                });
            }
        });
    });

    test("code completion", function (done) {
        const filepath: string = path.join(workspace, "code_completion.yara");
        vscode.workspace.openTextDocument(filepath).then(function (doc) {
            const ccProvider: YaraCompletionItemProvider = new YaraCompletionItemProvider();
            // "cuckoo.": Line 8, Col 12
            let pos: vscode.Position = new vscode.Position(9, 12);
            let tokenSource: vscode.CancellationTokenSource = new vscode.CancellationTokenSource();
            let items: Thenable<vscode.CompletionItem[] | vscode.CompletionList> | vscode.CompletionItem[] | vscode.CompletionList = ccProvider.provideCompletionItems(doc, pos, tokenSource.token, undefined);
            if (items instanceof Promise) {
                items.then(function (items) {
                    if (items[0].label == "network" || items[0].kind == vscode.CompletionItemKind.Class &&
                        items[1].label == "registry" || items[1].kind == vscode.CompletionItemKind.Class &&
                        items[2].label == "filesystem" || items[2].kind == vscode.CompletionItemKind.Class &&
                        items[3].label == "sync" || items[3].kind == vscode.CompletionItemKind.Class) {
                        done();
                    }
                });
            }
            else if (items instanceof vscode.CompletionList) {
                if (items.items[0].label == "network" || items.items[0].kind == vscode.CompletionItemKind.Class &&
                    items.items[1].label == "registry" || items.items[1].kind == vscode.CompletionItemKind.Class &&
                    items.items[2].label == "filesystem" || items.items[2].kind == vscode.CompletionItemKind.Class &&
                    items.items[3].label == "sync" || items.items[3].kind == vscode.CompletionItemKind.Class) {
                    done();
                }
            }
            else if (items instanceof Array) {
                if (items[0].label == "network" || items[0].kind == vscode.CompletionItemKind.Class &&
                    items[1].label == "registry" || items[1].kind == vscode.CompletionItemKind.Class &&
                    items[2].label == "filesystem" || items[2].kind == vscode.CompletionItemKind.Class &&
                    items[3].label == "sync" || items[3].kind == vscode.CompletionItemKind.Class) {
                    done();
                }
            }
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
        vscode.workspace.openTextDocument(filepath).then(function (doc) {
            let refProvider: vscode.ReferenceProvider = new YaraReferenceProvider();
            // $hex_string: Line 20, Col 11
            let pos: vscode.Position = new vscode.Position(19, 11);
            // console.log(`search term: ${doc.getText(doc.getWordRangeAtPosition(pos))}`);
            let ctx: vscode.ReferenceContext | null = null;
            let tokenSource: vscode.CancellationTokenSource = new vscode.CancellationTokenSource();
            let results = refProvider.provideReferences(doc, pos, ctx, tokenSource.token);
            let passed: boolean = true;
            const acceptableLines: Set<number> = new Set([19, 24, 39, 41]);
            if (results instanceof Array && results.length == 4) {
                results.forEach(reference => {
                    let refWordRange: vscode.Range = doc.getWordRangeAtPosition(reference.range.start);
                    let refWord: string = doc.getText(refWordRange);
                    if (refWord != "hex_string" && acceptableLines.has(reference.range.start.line)) { passed = false; }
                });
                if (passed) { done(); }
            }
            else if (results instanceof Promise) {
                results.then(function (references) {
                    if (references.length != 4) {
                        passed = false;
                    }
                    else {
                        references.forEach(reference => {
                            let refWordRange = doc.getWordRangeAtPosition(reference.range.start);
                            let refWord: string = doc.getText(refWordRange);
                            if (refWord != "hex_string" && acceptableLines.has(reference.range.start.line)) { passed = false; }
                        });
                    }
                    if (passed) { done(); }
                });
            }
        });
    });

    /*
        Trying to capture definitions for private rules
        Should align symbol `my_private_rule` with definition started by `private rule my_private_rule`
    */
   test("issue #32", function (done) {
        const filepath: string = path.join(workspace, "private_rule_goto.yara");
        vscode.workspace.openTextDocument(filepath).then(function (doc) {
            const defProvider: vscode.DefinitionProvider = new YaraDefinitionProvider();
            // my_private_rule: Line 10, Col 14
            let pos: vscode.Position = new vscode.Position(9, 14);
            let tokenSource: vscode.CancellationTokenSource = new vscode.CancellationTokenSource();
            let result = defProvider.provideDefinition(doc, pos, tokenSource.token);
            if (result instanceof vscode.Location) {
                let resultWordRange: vscode.Range = doc.getWordRangeAtPosition(result.range.start);
                let resultWord: string = doc.getText(resultWordRange);
                if (resultWord == "my_private_rule" && resultWordRange.start.line == 0 && resultWordRange.start.character == 13) { done(); }
            }
            else if (result instanceof Array) {
                // Should only get one result, so we've failed if an Array is returned
            }
            else if (result instanceof Promise) {
                result.then(function (definition) {
                    let resultWordRange: vscode.Range = doc.getWordRangeAtPosition(definition.range.start);
                    let resultWord: string = doc.getText(resultWordRange);
                    if (resultWord == "my_private_rule" && resultWordRange.start.line == 0 && resultWordRange.start.character == 13) { done(); }
                });
            }
        });
   });
});
