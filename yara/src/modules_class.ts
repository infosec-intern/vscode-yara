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
                ["AGGRESIVE_WS_TRIM", vscode.CompletionItemKind.Enum],
                ["algorithm", vscode.CompletionItemKind.Property],
                ["BYTES_REVERSED_LO", vscode.CompletionItemKind.Enum],
                ["BYTES_REVERSED_HI", vscode.CompletionItemKind.Enum],
                ["calculate_checksum", vscode.CompletionItemKind.Property],
                ["characteristics", vscode.CompletionItemKind.Class],
                ["checksum", vscode.CompletionItemKind.Property],
                ["clear_data", vscode.CompletionItemKind.Property],
                ["DEBUG_STRIPPED", vscode.CompletionItemKind.Enum],
                ["DLL", vscode.CompletionItemKind.Enum],
                ["dll_characteristics", vscode.CompletionItemKind.Class],
                ["DYNAMIC_BASE", vscode.CompletionItemKind.Enum],
                ["entry_point", vscode.CompletionItemKind.Property],
                ["EXECUTABLE_IMAGE", vscode.CompletionItemKind.Enum],
                ["FORCE_INTEGRITY", vscode.CompletionItemKind.Enum],
                ["exports", vscode.CompletionItemKind.Method],
                ["id", vscode.CompletionItemKind.Property],
                ["image_base", vscode.CompletionItemKind.Property],
                ["image_version", vscode.CompletionItemKind.Class],
                ["imphash", vscode.CompletionItemKind.Method],
                ["imports", vscode.CompletionItemKind.Method],
                ["issuer", vscode.CompletionItemKind.Property],
                ["is_dll", vscode.CompletionItemKind.Method],
                ["is_32bit", vscode.CompletionItemKind.Method],
                ["is_64bit", vscode.CompletionItemKind.Method],
                ["key", vscode.CompletionItemKind.Property],
                ["language", vscode.CompletionItemKind.Method],
                ["language_string", vscode.CompletionItemKind.Method],
                ["LARGE_ADDRESS_AWARE", vscode.CompletionItemKind.Enum],
                ["length", vscode.CompletionItemKind.Property],
                ["LINE_NUMS_STRIPPED", vscode.CompletionItemKind.Enum],
                ["linker_version", vscode.CompletionItemKind.Class],
                ["locale", vscode.CompletionItemKind.Method],
                ["LOCAL_SYMS_STRIPPED", vscode.CompletionItemKind.Enum],
                ["machine", vscode.CompletionItemKind.Class],
                ["MACHINE_AM33", vscode.CompletionItemKind.Enum],
                ["MACHINE_AMD64", vscode.CompletionItemKind.Enum],
                ["MACHINE_ARM", vscode.CompletionItemKind.Enum],
                ["MACHINE_ARMNT", vscode.CompletionItemKind.Enum],
                ["MACHINE_ARM64", vscode.CompletionItemKind.Enum],
                ["MACHINE_EBC", vscode.CompletionItemKind.Enum],
                ["MACHINE_I386", vscode.CompletionItemKind.Enum],
                ["MACHINE_IA64", vscode.CompletionItemKind.Enum],
                ["MACHINE_M32R", vscode.CompletionItemKind.Enum],
                ["MACHINE_MIPS16", vscode.CompletionItemKind.Enum],
                ["MACHINE_MIPSFPU", vscode.CompletionItemKind.Enum],
                ["MACHINE_MIPSFPU16", vscode.CompletionItemKind.Enum],
                ["MACHINE_POWERPC", vscode.CompletionItemKind.Enum],
                ["MACHINE_POWERPCFPU", vscode.CompletionItemKind.Enum],
                ["MACHINE_R4000", vscode.CompletionItemKind.Enum],
                ["MACHINE_SH3", vscode.CompletionItemKind.Enum],
                ["MACHINE_SH3DSP", vscode.CompletionItemKind.Enum],
                ["MACHINE_SH4", vscode.CompletionItemKind.Enum],
                ["MACHINE_SH5", vscode.CompletionItemKind.Enum],
                ["MACHINE_THUMB", vscode.CompletionItemKind.Enum],
                ["MACHINE_UNKNOWN", vscode.CompletionItemKind.Enum],
                ["MACHINE_WCEMIPSV2", vscode.CompletionItemKind.Enum],
                ["MACHINE_32BIT", vscode.CompletionItemKind.Enum],
                // applies to linker_, os_, subsystem_, resource_, and image_version
                ["major", vscode.CompletionItemKind.Property],
                ["minor", vscode.CompletionItemKind.Property],
                ["name", vscode.CompletionItemKind.Property],
                ["name_string", vscode.CompletionItemKind.Property],
                ["NET_RUN_FROM_SWAP", vscode.CompletionItemKind.Enum],
                ["NO_BIND", vscode.CompletionItemKind.Enum],
                ["NO_ISOLATION", vscode.CompletionItemKind.Enum],
                ["NO_SEH", vscode.CompletionItemKind.Enum],
                ["not_after", vscode.CompletionItemKind.Property],
                ["not_before", vscode.CompletionItemKind.Property],
                ["number_of_exports", vscode.CompletionItemKind.Property],
                ["number_of_imports", vscode.CompletionItemKind.Property],
                ["number_of_resources", vscode.CompletionItemKind.Property],
                ["number_of_sections", vscode.CompletionItemKind.Property],
                ["number_of_signatures", vscode.CompletionItemKind.Property],
                ["NX_COMPAT", vscode.CompletionItemKind.Enum],
                ["offset", vscode.CompletionItemKind.Property],
                ["os_version", vscode.CompletionItemKind.Class],
                ["overlay", vscode.CompletionItemKind.Class],
                ["raw_data", vscode.CompletionItemKind.Property],
                ["raw_data_offset", vscode.CompletionItemKind.Property],
                ["raw_data_size", vscode.CompletionItemKind.Property],
                ["RELOCS_STRIPPED", vscode.CompletionItemKind.Enum],
                ["REMOVABLE_RUN_FROM_SWAP", vscode.CompletionItemKind.Enum],
                ["resources", vscode.CompletionItemKind.Class],
                ["RESOURCE_TYPE_ACCELERATOR", vscode.CompletionItemKind.Enum],
                ["RESOURCE_TYPE_ANICURSOR", vscode.CompletionItemKind.Enum],
                ["RESOURCE_TYPE_ANIICON", vscode.CompletionItemKind.Enum],
                ["RESOURCE_TYPE_BITMAP", vscode.CompletionItemKind.Enum],
                ["RESOURCE_TYPE_CURSOR", vscode.CompletionItemKind.Enum],
                ["RESOURCE_TYPE_DIALOG", vscode.CompletionItemKind.Enum],
                ["RESOURCE_TYPE_DLGINCLUDE", vscode.CompletionItemKind.Enum],
                ["RESOURCE_TYPE_FONT", vscode.CompletionItemKind.Enum],
                ["RESOURCE_TYPE_FONTDIR", vscode.CompletionItemKind.Enum],
                ["RESOURCE_TYPE_GROUP_CURSOR", vscode.CompletionItemKind.Enum],
                ["RESOURCE_TYPE_GROUP_ICON", vscode.CompletionItemKind.Enum],
                ["RESOURCE_TYPE_HTML", vscode.CompletionItemKind.Enum],
                ["RESOURCE_TYPE_ICON", vscode.CompletionItemKind.Enum],
                ["RESOURCE_TYPE_MANIFEST", vscode.CompletionItemKind.Enum],
                ["RESOURCE_TYPE_MENU", vscode.CompletionItemKind.Enum],
                ["RESOURCE_TYPE_MESSAGETABLE", vscode.CompletionItemKind.Enum],
                ["RESOURCE_TYPE_PLUGPLAY", vscode.CompletionItemKind.Enum],
                ["RESOURCE_TYPE_RCDATA", vscode.CompletionItemKind.Enum],
                ["RESOURCE_TYPE_STRING", vscode.CompletionItemKind.Enum],
                ["RESOURCE_TYPE_VERSION", vscode.CompletionItemKind.Enum],
                ["RESOURCE_TYPE_VXD", vscode.CompletionItemKind.Enum],
                ["resource_timestamp", vscode.CompletionItemKind.Property],
                ["resource_version", vscode.CompletionItemKind.Class],
                ["rich_signature", vscode.CompletionItemKind.Class],
                ["rva_to_offset", vscode.CompletionItemKind.Method],
                ["sections", vscode.CompletionItemKind.Class],
                ["SECTION_CNT_CODE", vscode.CompletionItemKind.Enum],
                ["SECTION_CNT_INITIALIZED_DATA", vscode.CompletionItemKind.Enum],
                ["SECTION_CNT_UNINITIALIZED_DATA", vscode.CompletionItemKind.Enum],
                ["SECTION_GPREL", vscode.CompletionItemKind.Enum],
                ["SECTION_LNK_NRELOC_OVFL", vscode.CompletionItemKind.Enum],
                ["SECTION_MEM_DISCARDABLE", vscode.CompletionItemKind.Enum],
                ["SECTION_MEM_EXECUTE", vscode.CompletionItemKind.Enum],
                ["SECTION_MEM_NOT_CACHED", vscode.CompletionItemKind.Enum],
                ["SECTION_MEM_NOT_PAGED", vscode.CompletionItemKind.Enum],
                ["SECTION_MEM_READ", vscode.CompletionItemKind.Enum],
                ["SECTION_MEM_SHARED", vscode.CompletionItemKind.Enum],
                ["SECTION_MEM_WRITE", vscode.CompletionItemKind.Enum],
                ["SECTION_MEM_16BIT", vscode.CompletionItemKind.Enum],
                ["section_index", vscode.CompletionItemKind.Method],
                ["serial", vscode.CompletionItemKind.Property],
                ["signatures", vscode.CompletionItemKind.Class],
                ["size", vscode.CompletionItemKind.Enum],
                ["subject", vscode.CompletionItemKind.Property],
                ["subsystem", vscode.CompletionItemKind.Class],
                ["SUBSYSTEM_EFI_APPLICATION", vscode.CompletionItemKind.Enum],
                ["SUBSYSTEM_EFI_BOOT_SERVICE_DRIVER", vscode.CompletionItemKind.Enum],
                ["SUBSYSTEM_EFI_RUNTIME_DRIVER", vscode.CompletionItemKind.Enum],
                ["SUBSYSTEM_NATIVE", vscode.CompletionItemKind.Enum],
                ["SUBSYSTEM_NATIVE_WINDOWS", vscode.CompletionItemKind.Enum],
                ["SUBSYSTEM_OS2_CUI", vscode.CompletionItemKind.Enum],
                ["SUBSYSTEM_POSIX_CUI", vscode.CompletionItemKind.Enum],
                ["SUBSYSTEM_UNKNOWN", vscode.CompletionItemKind.Enum],
                ["SUBSYSTEM_WINDOWS_BOOT_APPLICATIONS", vscode.CompletionItemKind.Enum],
                ["SUBSYSTEM_WINDOWS_CUI", vscode.CompletionItemKind.Enum],
                ["SUBSYSTEM_WINDOWS_CE_GUI", vscode.CompletionItemKind.Enum],
                ["SUBSYSTEM_WINDOWS_GUI", vscode.CompletionItemKind.Enum],
                ["SUBSYSTEM_XBOX", vscode.CompletionItemKind.Enum],
                ["subsystem_version", vscode.CompletionItemKind.Class],
                ["SYSTEM", vscode.CompletionItemKind.Enum],
                ["TERMINAL_SERVER_AWARE", vscode.CompletionItemKind.Enum],
                ["timestamp", vscode.CompletionItemKind.Property],
                ["toolid", vscode.CompletionItemKind.Method],
                ["type", vscode.CompletionItemKind.Property],
                ["type_string", vscode.CompletionItemKind.Property],
                ["UP_SYSTEM_ONLY", vscode.CompletionItemKind.Enum],
                ["WDM_DRIVER", vscode.CompletionItemKind.Enum],
                ["valid_on", vscode.CompletionItemKind.Method],
                ["version", vscode.CompletionItemKind.Method],
                ["version_info", vscode.CompletionItemKind.Class],
                ["virtual_address", vscode.CompletionItemKind.Property],
                ["virtual_size", vscode.CompletionItemKind.Property]
            ];
        }
        else if (name == "elf") {
            return [
                ["address", vscode.CompletionItemKind.Property],
                ["dynamic_section_entries", vscode.CompletionItemKind.Property],
                ["dynamic", vscode.CompletionItemKind.Class],
                ["ET_NONE", vscode.CompletionItemKind.Enum],
                ["ET_REL", vscode.CompletionItemKind.Enum],
                ["ET_EXEC", vscode.CompletionItemKind.Enum],
                ["ET_DYN", vscode.CompletionItemKind.Enum],
                ["ET_CORE", vscode.CompletionItemKind.Enum],
                ["EM_M32", vscode.CompletionItemKind.Enum],
                ["EM_SPARC", vscode.CompletionItemKind.Enum],
                ["EM_386", vscode.CompletionItemKind.Enum],
                ["EM_68K", vscode.CompletionItemKind.Enum],
                ["EM_88K", vscode.CompletionItemKind.Enum],
                ["EM_860", vscode.CompletionItemKind.Enum],
                ["EM_MIPS", vscode.CompletionItemKind.Enum],
                ["EM_MIPS_RS3_LE", vscode.CompletionItemKind.Enum],
                ["EM_PPC", vscode.CompletionItemKind.Enum],
                ["EM_PPC64", vscode.CompletionItemKind.Enum],
                ["EM_ARM", vscode.CompletionItemKind.Enum],
                ["EM_X86_64", vscode.CompletionItemKind.Enum],
                ["EM_AARCH64", vscode.CompletionItemKind.Enum],
                ["entry_point", vscode.CompletionItemKind.Property],
                ["flags", vscode.CompletionItemKind.Property],
                ["machine", vscode.CompletionItemKind.Property],
                ["name", vscode.CompletionItemKind.Property],
                ["number_of_sections", vscode.CompletionItemKind.Property],
                ["number_of_segments", vscode.CompletionItemKind.Property],
                ["offset", vscode.CompletionItemKind.Property],
                ["sections", vscode.CompletionItemKind.Class],
                ["segments", vscode.CompletionItemKind.Class],
                ["SHF_ALLOC", vscode.CompletionItemKind.Enum],
                ["SHF_WRITE", vscode.CompletionItemKind.Enum],
                ["SHF_EXECINSTR", vscode.CompletionItemKind.Enum],
                ["SHT_DYNAMIC", vscode.CompletionItemKind.Enum],
                ["SHT_DYNSYM", vscode.CompletionItemKind.Enum],
                ["SHT_HASH", vscode.CompletionItemKind.Enum],
                ["SHT_NOBITS", vscode.CompletionItemKind.Enum],
                ["SHT_NOTE", vscode.CompletionItemKind.Enum],
                ["SHT_NULL", vscode.CompletionItemKind.Enum],
                ["SHT_PROGBITS", vscode.CompletionItemKind.Enum],
                ["SHT_REL", vscode.CompletionItemKind.Enum],
                ["SHT_RELA", vscode.CompletionItemKind.Enum],
                ["SHT_SHLIB", vscode.CompletionItemKind.Enum],
                ["SHT_STRTAB", vscode.CompletionItemKind.Enum],
                ["SHT_SYMTAB", vscode.CompletionItemKind.Enum],
                ["size", vscode.CompletionItemKind.Property],
                ["symtab", vscode.CompletionItemKind.Class],
                ["symtab_entries", vscode.CompletionItemKind.Property],
                ["type", vscode.CompletionItemKind.Property]
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
