"use strict";

import * as vscode from "vscode";


// variables have a few possible first characters - use these to identify vars vs. rules
const varFirstChar: Set<string> = new Set(["$", "#", "@", "!"]);

/*
    Get the start and end boundaries for the current YARA rule based on a symbol's position
*/
function GetRuleRange(lines: string[], symbol: vscode.Position) {
    let begin: vscode.Position|null = null;
    let end: vscode.Position|null = null;
    const startRuleRegexp = RegExp("^rule ");
    const endRuleRegexp = RegExp("^\}");
    // find the nearest reference to "rule" by traversing the lines in reverse order
    for (let lineNo = symbol.line; lineNo >= 0; lineNo--) {
        if (startRuleRegexp.test(lines[lineNo])) {
            begin = new vscode.Position(lineNo, 0);
            break;
        }
    }
    // start up this loop again using the beginning of the rule
    // and find the line with just a curly brace to identify the end of a rule
    for (let lineNo = begin.line; lineNo < lines.length; lineNo++) {
        if (endRuleRegexp.test(lines[lineNo])) {
            end = new vscode.Position(lineNo, 0);
            break;
        }
    }
    return new vscode.Range(begin, end);
}

export class YaraCompletionItemProvider implements vscode.CompletionItemProvider {
    public provideCompletionItems(doc: vscode.TextDocument, pos: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): Thenable<vscode.CompletionItem[]> {
        // provide completion for YARA modules
        // will have to be static until I can figure out a better method
        const module_list: Set<string> = new Set(["pe", "elf", "cuckoo", "magic", "magic", "hash", "math", "time"]);
        const modules  = {
            "pe": ["machine", "checksum", "calculate_checksum", "subsystem", "timestamp",
                   "entry_point", "image_base", "characteristics", "linker_version",
                   "os_version", "image_version", "subsystem_version", "dll_characteristics",
                   "number_of_sections", "sections", "overlay", "number_of_resources",
                   "resource_timestamp", "resource_version", "resources", "version_info",
                   "number_of_signatures", "signatures", "rich_signature", "exports",
                   "number_of_exports", "number_of_imports", "imports", "locale", "language",
                   "imphash", "section_index", "is_dll", "is_32bit", "is_64bit", "rva_to_offset"],
            "elf": ["type", "machine", "entry_point", "number_of_sections", "sections", "number_of_segments",
                    "segments", "dynamic_section_entries", "dynamic", "symtab_entries", "symtab"],
            "cuckoo": ["network", "registry", "filesystem", "sync"],
            "magic": ["type", "mime_type"],
            "hash": ["md5", "sha1", "sha256", "checksum32"],
            "math": ["entropy", "monte_carlo_pi", "serial_correlation", "mean", "deviation", "in_range"],
            "dotnet": ["version", "module_name", "number_of_streams", "streams", "number_of_guids",
                       "guids", "number_of_resources", "resources", "assembly", "number_of_modulerefs",
                       "modulerefs", "typelib", "assembly_refs", "number_of_user_strings", "user_strings"],
            "time": ["now"]
        };
        let module_start = new vscode.Position(pos.line, pos.character - 1);
        let module_range = doc.getWordRangeAtPosition(module_start);
        let symbol: string = doc.getText(module_range);
        if (context.triggerCharacter == "." && module_list.has(symbol)) {
            let items: vscode.CompletionItem[] = Array<vscode.CompletionItem>();
            let list: vscode.CompletionList = new vscode.CompletionList(items, false);
            const range: vscode.Range = doc.getWordRangeAtPosition(pos);
            console.log(`symbol: ${JSON.stringify(symbol)}`);
        }
        return null
    }
}

export class YaraDefinitionProvider implements vscode.DefinitionProvider {
    public provideDefinition(doc: vscode.TextDocument, pos: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.Location> {
        return new Promise((resolve, reject) => {
            let definition: vscode.Location|null = null;
            const fileUri: vscode.Uri = vscode.Uri.file(doc.fileName);
            const range: vscode.Range = doc.getWordRangeAtPosition(pos);
            const symbol: string = doc.getText(range);
            // console.log(`Providing definition for symbol '${symbol}'`);
            let possibleVarStart: vscode.Position = new vscode.Position(range.start.line, range.start.character - 1);
            let possibleVarRange: vscode.Range = new vscode.Range(possibleVarStart, range.end);
            let possibleVar: string = doc.getText(possibleVarRange);
            const lines: string[] = doc.getText().split("\n");
            if (varFirstChar.has(possibleVar.charAt(0))) {
                // console.log(`Variable detected: ${possibleVar}`);
                let currentRuleRange: vscode.Range = GetRuleRange(lines, pos);
                // console.log(`Curr rule range: ${currentRuleRange.start.line+1} -> ${currentRuleRange.end.line+1}`);
                for (let lineNo = currentRuleRange.start.line; lineNo < currentRuleRange.end.line; lineNo++) {
                    let character: number = lines[lineNo].indexOf(`$${symbol} =`);
                    if (character != -1) {
                        // console.log(`Found defintion of '${possibleVar}' on line ${lineNo + 1} at character ${character + 1}`);
                        // gotta add one because VSCode won't recognize the '$' as part of the symbol
                        let defPosition: vscode.Position = new vscode.Position(lineNo, character + 1);
                        definition = new vscode.Location(fileUri, defPosition);
                        break;
                    }
                }
            }
            else {
                for (let lineNo = 0; lineNo < pos.line; lineNo++) {
                    let character: number = lines[lineNo].indexOf(symbol);
                    if (character != -1 && lines[lineNo].startsWith("rule")) {
                        // console.log(`Found ${symbol} on line ${lineNo} at character ${character}`);
                        let defPosition: vscode.Position = new vscode.Position(lineNo, character);
                        definition = new vscode.Location(fileUri, defPosition);
                        break;
                    }
                }
            }
            if (definition != null) {
                resolve(definition);
            }
            else {
                reject();
            }
        });
    }
}

export class YaraReferenceProvider implements vscode.ReferenceProvider {
    public provideReferences(doc: vscode.TextDocument, pos: vscode.Position, options: { includeDeclaration: boolean }, token: vscode.CancellationToken): Thenable<vscode.Location[]> {
        return new Promise((resolve, reject) => {
            const fileUri: vscode.Uri = vscode.Uri.file(doc.fileName);
            const range: vscode.Range = doc.getWordRangeAtPosition(pos);
            let lines: string[] = doc.getText().split("\n");
            let references: vscode.Location[] = new Array<vscode.Location>();
            let symbol: string = doc.getText(range);
            // console.log(`Providing references for symbol '${symbol}'`);
            let possibleVarStart: vscode.Position = new vscode.Position(range.start.line, range.start.character - 1);
            let possibleVarRange: vscode.Range = new vscode.Range(possibleVarStart, range.end);
            let possibleVar: string = doc.getText(possibleVarRange);
            if (varFirstChar.has(possibleVar.charAt(0))) {
                let varRegexp: string;
                let startLine: number;
                let endLine: number;
                // console.log(`Identified symbol as a variable: ${symbol}`);
                let possibleWildcardEnd: vscode.Position = new vscode.Position(range.end.line, range.end.character + 1);
                let possibleWildcardRange: vscode.Range = new vscode.Range(possibleVarStart, possibleWildcardEnd);
                let possibleWildcard: string = doc.getText(possibleWildcardRange);
                if (possibleWildcard.slice(-1) == "*") {
                    // treat like a wildcard and search only the local rule
                    varRegexp = `[\$#@!]${symbol}[a-zA-Z0-9_]+`;
                    let ruleRange = GetRuleRange(lines, pos);
                    startLine = ruleRange.start.line;
                    endLine = ruleRange.end.line;
                }
                else {
                    // treat like a normal variable reference and search the whole document
                    varRegexp = `[\$#@!]${symbol}[^a-zA-Z0-9_]`;
                    startLine = 0;
                    endLine = lines.length;
                }
                for (let lineNo = startLine; lineNo < endLine; lineNo++) {
                    let character: number = lines[lineNo].search(varRegexp);
                    if (character != -1) {
                        // console.log(`Found ${symbol} on line ${lineNo} at character ${character}`);
                        // have to readjust the character index
                        let refPosition: vscode.Position = new vscode.Position(lineNo, character + 1);
                        references.push(new vscode.Location(fileUri, refPosition));
                    }

                }
            }
            else {
                let lineNo = 0;
                lines.forEach(line => {
                    let character: number = line.indexOf(symbol);
                    if (character != -1) {
                        // console.log(`Found ${symbol} on line ${lineNo} at character ${character}`);
                        let refPosition: vscode.Position = new vscode.Position(lineNo, character);
                        references.push(new vscode.Location(fileUri, refPosition));
                    }
                    lineNo++;
                });
            }
            if (references != null) {
                resolve(references);
            }
            else {
                reject();
            }
        });
    }
}

export function activate(context: vscode.ExtensionContext) {
    // console.log("Activating Yara extension");
    let YARA: vscode.DocumentSelector = { language: "yara", scheme: "file" };
    let definitionDisposable: vscode.Disposable = vscode.languages.registerDefinitionProvider(YARA, new YaraDefinitionProvider());
    let referenceDisposable: vscode.Disposable = vscode.languages.registerReferenceProvider(YARA, new YaraReferenceProvider());
    vscode.languages.registerCompletionItemProvider(YARA, new YaraCompletionItemProvider(), '.');
    context.subscriptions.push(definitionDisposable);
    context.subscriptions.push(referenceDisposable);
};

export function deactivate(context: vscode.ExtensionContext) {
    // console.log("Deactivating Yara extension");
    context.subscriptions.forEach(disposable => {
        disposable.dispose();
    });
};
