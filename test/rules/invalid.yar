rule HexStrings
{
    meta:
        description = "Example rule for vscode-yara issues #26 and #49"
    strings:
        $invalid = {ee ff gg hh ><}
        $valid_jmp = { 00 11 22 33 [-] 88 99 }
        $valid_jmp1 = { 00 11 22 33 [4] 88 99 }
        $valid_jmp2 = { 00 11 22 33 [4-] 88 99 }
        $valid_jmp3 = { 00 11 22 33 [4-6] 88 99 }
        $invalid_jmp = { 00 11 22 33 [6-4] 88 99 }
    condition:
        any of them
}
rule TextStrings
{
    meta:
        description = "Example rule for vscode-yara issues #28 and #49"
    strings:
        $invalid = "C:\Users" ascii wide
        $valid = "C:\\Users" ascii wide
        $invalid_escape1 = "C:\\\Users" ascii wide
        $invalid_escape2 = "C:\\\Users\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\" ascii wide
        $valid_escape1 = "C:\"Users\"" ascii wide
        $valid_escape2 = "C:\\\"Users\"" ascii wide
        $valid_escape3 = "C:\\\" Users \"" ascii wide
        $valid_escape4 = "C:\\Users" ascii wide       // "quoted comment"
        $valid_escape5 = "/root/users" ascii wide    // "quoted comment"
        $valid_escape6 = "/\"root\"/users" ascii wide    // "quoted comment"
        $valid_escape7 = "C:\"Users" ascii wide
        $valid_escape8 = "C:\"Users" ascii wide     // "quoted comment"
        $valid_escape9 = "C:\\Users\\" ascii wide
        $valid_escape10 = "C:\\Users\\" ascii wide  // "quoted comment"
    condition:
        any of them
}
rule EscapeSequences
{
    meta:
        description = "Example rule for vscode-yara issue #49"
    strings:
        $double = "abc\"def"        // \" 	double quote
        $slash = "abc\\def"         // \\ 	backslash
        $newline = "abc\ndef"       // \n 	line feed - new line
        $return = "abc\rdef"        // \r 	carriage return - available in 4.1.0+
        $tab = "abc\tdef"           // \t 	horizontal tab
        $hex = "abc\x12def"         // \xnn 	arbitrary hexadecimal value
        $invalid_hex = "abc\x1Qdef"        // invalid hex sequence
    condition:
        any of them
}
