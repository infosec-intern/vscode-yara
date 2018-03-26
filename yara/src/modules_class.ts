"use strict";

import * as vscode from "vscode";

// provide completion for YARA modules
// will have to be static until I can figure out a better method
export const modules = {
    has: function (name: string) {
        let list: Set<string> = new Set(["pe", "elf", "cuckoo", "magic", "magic", "hash", "math", "dotnet", "time"]);
        return list.has(name);
    },
    get: function (name: string) {
        // a terrible method for providing these items
        // but i have no idea how to do this crap in (type|java)script properly
        let items: null | Array<string>;
        if (name == "pe") {
            return [
                ["machine", vscode.CompletionItemKind.Enum],
                ["checksum", vscode.CompletionItemKind.Property],
                ["calculate_checksum", vscode.CompletionItemKind.Property],
                ["subsystem", vscode.CompletionItemKind.Enum],
                ["timestamp", vscode.CompletionItemKind.Property],
                ["entry_point", vscode.CompletionItemKind.Property],
                ["image_base", vscode.CompletionItemKind.Property],
                ["characteristics", vscode.CompletionItemKind.Enum],
                ["linker_version", vscode.CompletionItemKind.Class],
                ["os_version", vscode.CompletionItemKind.Class],
                ["image_version", vscode.CompletionItemKind.Class],
                ["subsystem_version", vscode.CompletionItemKind.Class],
                ["dll_characteristics", vscode.CompletionItemKind.Enum],
                ["number_of_sections", vscode.CompletionItemKind.Property],
                ["sections", vscode.CompletionItemKind.Class],
                ["overlay", vscode.CompletionItemKind.Class],
                ["number_of_resources", vscode.CompletionItemKind.Property],
                ["resource_timestamp", vscode.CompletionItemKind.Property],
                ["resource_version", vscode.CompletionItemKind.Class],
                ["resources", vscode.CompletionItemKind.Class],
                ["version_info", vscode.CompletionItemKind.Class],
                ["number_of_signatures", vscode.CompletionItemKind.Property],
                ["signatures", vscode.CompletionItemKind.Class],
                ["rich_signature", vscode.CompletionItemKind.Class],
                ["exports", vscode.CompletionItemKind.Method],
                ["number_of_exports", vscode.CompletionItemKind.Property],
                ["number_of_imports", vscode.CompletionItemKind.Property],
                ["imports", vscode.CompletionItemKind.Method],
                ["locale", vscode.CompletionItemKind.Method],
                ["language", vscode.CompletionItemKind.Method],
                ["imphash", vscode.CompletionItemKind.Method],
                ["section_index", vscode.CompletionItemKind.Method],
                ["is_dll", vscode.CompletionItemKind.Method],
                ["is_32bit", vscode.CompletionItemKind.Method],
                ["is_64bit", vscode.CompletionItemKind.Method],
                ["rva_to_offset", vscode.CompletionItemKind.Method]
            ];
        }
        else if (name == "elf") {
            return [
                ["type", vscode.CompletionItemKind.Enum],
                ["machine", vscode.CompletionItemKind.Enum],
                ["entry_point", vscode.CompletionItemKind.Property],
                ["number_of_sections", vscode.CompletionItemKind.Property],
                ["sections", vscode.CompletionItemKind.Class],
                ["number_of_segments", vscode.CompletionItemKind.Property],
                ["segments", vscode.CompletionItemKind.Class],
                ["dynamic_section_entries", vscode.CompletionItemKind.Property],
                ["dynamic", vscode.CompletionItemKind.Class],
                ["symtab_entries", vscode.CompletionItemKind.Property],
                ["symtab", vscode.CompletionItemKind.Class]
            ];
        }
        else if (name == "cuckoo") {
            return [
                ["network", vscode.CompletionItemKind.Class],
                ["registry", vscode.CompletionItemKind.Class],
                ["filesystem", vscode.CompletionItemKind.Class],
                ["sync", vscode.CompletionItemKind.Class]
            ];
        }
        else if (name == "magic") {
            return [
                ["type", vscode.CompletionItemKind.Method],
                ["mime_type", vscode.CompletionItemKind.Method]
            ];
        }
        else if (name == "hash") {
            return [
                ["md5", vscode.CompletionItemKind.Method],
                ["sha1", vscode.CompletionItemKind.Method],
                ["sha256", vscode.CompletionItemKind.Method],
                ["checksum32", vscode.CompletionItemKind.Method]
            ];
        }
        else if (name == "math") {
            return [
                ["entropy", vscode.CompletionItemKind.Method],
                ["monte_carlo_pi", vscode.CompletionItemKind.Method],
                ["serial_correlation", vscode.CompletionItemKind.Method],
                ["mean", vscode.CompletionItemKind.Method],
                ["deviation", vscode.CompletionItemKind.Method],
                ["in_range", vscode.CompletionItemKind.Method]
            ];
        }
        else if (name == "dotnet") {
            return [
                ["version", vscode.CompletionItemKind.Property],
                ["module_name", vscode.CompletionItemKind.Property],
                ["number_of_streams", vscode.CompletionItemKind.Property],
                ["streams", vscode.CompletionItemKind.Class],
                ["number_of_guids", vscode.CompletionItemKind.Property],
                ["guids", vscode.CompletionItemKind.Property],
                ["number_of_resources", vscode.CompletionItemKind.Property],
                ["resources", vscode.CompletionItemKind.Class],
                ["assembly", vscode.CompletionItemKind.Class],
                ["number_of_modulerefs", vscode.CompletionItemKind.Property],
                ["modulerefs", vscode.CompletionItemKind.Property],
                ["typelib", vscode.CompletionItemKind.Property],
                ["assembly_refs", vscode.CompletionItemKind.Class],
                ["number_of_user_strings", vscode.CompletionItemKind.Property],
                ["user_strings", vscode.CompletionItemKind.Property]
            ];
        }
        else if (name == "time") {
            return [
                ["now", vscode.CompletionItemKind.Method]
            ];
        }
        return null;
    }
};
