"use strict";

/*
Note: This example test is leveraging the Mocha test framework.
Please refer to their documentation on https://mochajs.org/ for help.
*/

import * as path from "path";
import * as vscode from "vscode";
import * as yara from "../yara/src/extension";

let workspace = path.join(__dirname, "..", "..", "test/rules/");

suite("YARA: Provider", function () {
    test("rule definition", function (done) {
        const filepath: string = path.join(workspace, "peek_rules.yara");
        vscode.workspace.openTextDocument(filepath).then(function (doc) {
            let defProvider: vscode.DefinitionProvider = new yara.YaraDefinitionProvider();
            // SyntaxExample: Line 42, Col 14
            // line numbers start at 0, so we have to subtract one for the lookup
            let pos: vscode.Position = new vscode.Position(41, 14);
            let tokenSource: vscode.CancellationTokenSource = new vscode.CancellationTokenSource();
            let result = defProvider.provideDefinition(doc, pos, tokenSource.token);
            if (result instanceof vscode.Location) {
                let resultWordRange: vscode.Range = doc.getWordRangeAtPosition(result.range.start);
                let resultWord: string = doc.getText(resultWordRange);
                if (resultWord == "SyntaxExample") { done(); }
            }
            else if (result instanceof Array) {
                let resultWordRange: vscode.Range = doc.getWordRangeAtPosition(result[0].range.start);
                let resultWord: string = doc.getText(resultWordRange);
                if (resultWord == "SyntaxExample") { done(); }
            }
            else if (result instanceof Promise) {
                result.then(function (definition) {
                    let resultWordRange: vscode.Range = doc.getWordRangeAtPosition(definition.range.start);
                    let resultWord: string = doc.getText(resultWordRange);
                    if (resultWord == "SyntaxExample") { done(); }
                });
            }
        });
    });

    test("variable definition", function (done) {
        const filepath: string = path.join(workspace, "peek_rules.yara");
        vscode.workspace.openTextDocument(filepath).then(function (doc) {
            let defProvider: vscode.DefinitionProvider = new yara.YaraDefinitionProvider();
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

    test("rule references", function (done) {
        const filepath: string = path.join(workspace, "peek_rules.yara");
        vscode.workspace.openTextDocument(filepath).then(function (doc) {
            let refProvider: vscode.ReferenceProvider = new yara.YaraReferenceProvider();
            // $dstring: Line 22, Col 11
            let pos: vscode.Position = new vscode.Position(21, 11);
            // console.log(`search term: ${doc.getText(doc.getWordRangeAtPosition(pos))}`);
            let ctx: vscode.ReferenceContext|null = null;
            let tokenSource: vscode.CancellationTokenSource = new vscode.CancellationTokenSource();
            let results = refProvider.provideReferences(doc, pos, ctx, tokenSource.token);
            let passed: boolean = true;
            if (results instanceof Array && results.length == 3) {
                results.forEach(reference => {
                    let refWordRange: vscode.Range = doc.getWordRangeAtPosition(reference.range.start);
                    let refWord: string = doc.getText(refWordRange);
                    if (refWord != "dstring") { passed = false; }
                });
                if (passed) { done(); }
            }
            else if (results instanceof Promise) {
                results.then(function(references) {
                    if (references.length != 3) {
                        passed = false;
                    }
                    else {
                        references.forEach(reference => {
                            let refWordRange = doc.getWordRangeAtPosition(reference.range.start);
                            let refWord: string = doc.getText(refWordRange);
                            if (refWord != "dstring") { passed = false; }
                        });
                        if (passed) { done(); }
                    }
                });
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
            let refProvider: vscode.ReferenceProvider = new yara.YaraReferenceProvider();
            // $hex_string: Line 20, Col 11
            let pos: vscode.Position = new vscode.Position(19, 11);
            // console.log(`search term: ${doc.getText(doc.getWordRangeAtPosition(pos))}`);
            let ctx: vscode.ReferenceContext|null = null;
            let tokenSource: vscode.CancellationTokenSource = new vscode.CancellationTokenSource();
            let results = refProvider.provideReferences(doc, pos, ctx, tokenSource.token);
            let passed: boolean = true;
            if (results instanceof Array && results.length == 4) {
                results.forEach(reference => {
                    let refWordRange: vscode.Range = doc.getWordRangeAtPosition(reference.range.start);
                    let refWord: string = doc.getText(refWordRange);
                    if (refWord != "hex_string") { passed = false; }
                });
                if (passed) { done(); }
            }
            else if (results instanceof Promise) {
                results.then(function(references) {
                    if (references.length != 4) {
                        passed = false;
                    }
                    else {
                        references.forEach(reference => {
                            let refWordRange = doc.getWordRangeAtPosition(reference.range.start);
                            let refWord: string = doc.getText(refWordRange);
                            if (refWord != "hex_string") { passed = false; }
                        });
                        if (passed) { done(); }
                    }
                });
            }
        });
    });
});
