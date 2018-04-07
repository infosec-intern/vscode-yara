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
        let items: null | Array<string> = null;
        return items;
    }
};
