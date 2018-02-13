"use strict";

/*
Note: This example test is leveraging the Mocha test framework.
Please refer to their documentation on https://mochajs.org/ for help.
*/

import * as assert from "assert";
import * as path from "path";
import * as vscode from "vscode";
import * as yara from "../yara/src/extension";

let workspace = path.join(__dirname, "..", "..", "test/rules/");

suite("YARA: Provider", function () {
    test("rule definition", function (done) {
        const filepath: string = path.join(workspace, "peek_rules.yara");
        vscode.workspace.openTextDocument(filepath).then(function (doc) {
            let defProvider: vscode.DefinitionProvider = new yara.YaraDefinitionProvider();
            // SyntaxExample: Line 40, Col 14
            // line numbers start at 0, so we have to subtract one for the lookup
            let pos: vscode.Position = new vscode.Position(39, 14);
            let tokenSource: vscode.CancellationTokenSource = new vscode.CancellationTokenSource();
            let result = defProvider.provideDefinition(doc, pos, tokenSource.token);
            if (result instanceof vscode.Location) {
                let resultWordRange: vscode.Range = doc.getWordRangeAtPosition(result.range.start);
                let resultWord: string = doc.getText(resultWordRange);
                if (resultWord == "SyntaxExample") {
                    done();
                }
            }
            else if (result instanceof Array) {
                let resultWordRange: vscode.Range = doc.getWordRangeAtPosition(result[0].range.start);
                let resultWord: string = doc.getText(resultWordRange);
                if (resultWord == "SyntaxExample") {
                    done();
                }
            }
            else if (result instanceof Promise) {
                result.then(function (definition) {
                    let resultWordRange: vscode.Range = doc.getWordRangeAtPosition(definition.range.start);
                    let resultWord: string = doc.getText(resultWordRange);
                    if (resultWord == "SyntaxExample") {
                        done();
                    }
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
            let ctx: vscode.ReferenceContext = null;
            let tokenSource: vscode.CancellationTokenSource = new vscode.CancellationTokenSource();
            let references = refProvider.provideReferences(doc, pos, ctx, tokenSource.token);
            console.log(`references: ${JSON.stringify(references)}`);
            done();
        });
    });
});
