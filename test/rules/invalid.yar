rule InvalidHexString
{
    meta:
        description = "Example rule for vscode-yara issue #26"
    strings:
        $h = {ee ff gg hh ><}
    condition:
        any of them
}
rule InvalidString
{
    meta:
        description = "Example rule for vscode-yara issue #28"
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
