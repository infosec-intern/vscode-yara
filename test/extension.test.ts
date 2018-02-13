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

suite("YARA: Provider", function() {
    test("rule definition", function(done) {
        const filepath: string = path.join(workspace, "peek_rules.yara");
        vscode.workspace.openTextDocument(filepath).then(function(doc) {
            done();
        });
    });

    test("rule references", function(done) {
        const filepath: string = path.join(workspace, "peek_rules.yara");
        vscode.workspace.openTextDocument(filepath).then(function(doc) {
            done();
        });
    });
});
