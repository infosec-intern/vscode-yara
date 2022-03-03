'use strict';

import vscode = require('vscode');


export const output: vscode.OutputChannel = vscode.window.createOutputChannel('YARA');
// variables have a few possible first characters - use these to identify vars vs. rules
export const varFirstChar: Set<string> = new Set(['$', '#', '@', '!']);

/*
    Send a given message to the output channel with a timestamp
*/
export function log(message: string): void {
    output.appendLine(`[${new Date().toISOString()}] ${message}`);
}

/*
    Get the start and end boundaries for the current YARA rule based on a symbol's position
*/
export function GetRuleRange(lines: string[], symbol: vscode.Position): vscode.Range {
    let begin: vscode.Position | null = null;
    let end: vscode.Position | null = null;
    // find the nearest reference to 'rule' by traversing the lines in reverse order
    for (let lineNo = symbol.line; lineNo >= 0; lineNo--) {
        if (IsRuleStart(lines[lineNo])) {
            begin = new vscode.Position(lineNo, 0);
            break;
        }
    }
    // start up this loop again using the beginning of the rule
    // and find the line with just a curly brace to identify the end of a rule
    for (let lineNo = begin.line; lineNo < lines.length; lineNo++) {
        if (IsRuleEnd(lines[lineNo])) {
            end = new vscode.Position(lineNo, 0);
            break;
        }
    }
    return new vscode.Range(begin, end);
}

/*
    Determine if the given line is the start of a YARA rule or not
*/
export function IsRuleStart(line: string): boolean {
    return new RegExp('^(private )?rule ').test(line);
}

/*
    Determine if the given line is the end of a YARA rule or not
*/
export function IsRuleEnd(line: string): boolean {
    return new RegExp('^}').test(line);
}
