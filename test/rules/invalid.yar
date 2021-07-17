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
        $valid_escape11 = "C:\\\Users\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\" ascii wide
    condition:
        any of them
}
rule EscapeSequences
{
    meta:
        description = "Example rule for vscode-yara issue #49"
    strings:
        // Simple escape sequences
        // \' 	single quote 	byte 0x27 in ASCII encoding
        // \" 	double quote 	byte 0x22 in ASCII encoding
        // \? 	question mark 	byte 0x3f in ASCII encoding
        // \\ 	backslash 	byte 0x5c in ASCII encoding
        // \a 	audible bell 	byte 0x07 in ASCII encoding
        // \b 	backspace 	byte 0x08 in ASCII encoding
        // \f 	form feed - new page 	byte 0x0c in ASCII encoding
        // \n 	line feed - new line 	byte 0x0a in ASCII encoding
        // \r 	carriage return 	byte 0x0d in ASCII encoding
        // \t 	horizontal tab 	byte 0x09 in ASCII encoding
        // \v 	vertical tab 	byte 0x0b in ASCII encoding
        $single = "abc\'def"
        $double = "abc\"def"
        $question = "abc\?def"
        $tab = "abc\tdef"
        $space = "abc\sdef"
        $slash = "abc\\def"
        $audible = "abc\adef"
        $backspace = "abc\bdef"
        $formfeed = "abc\fdef"
        $newline = "abc\ndef"
        $carriage = "abc\rdef"
        $verticaltab = "abc\vdef"
        // Numeric escape sequences
        // \nnn 	arbitrary octal value 	byte nnn
        // \xnn 	arbitrary hexadecimal value 	byte nn
        $octal = "abc\012def"
        $hex = "abc\x12def"
        // Conditional escape sequences[1]
        // \c 	Implementation-defined 	Implementation-defined
        $conditional = "abc\cdef"
        // Universal character names
        // \unnnn 	arbitrary Unicode value;
        // may result in several code units 	code point U+nnnn
        // \Unnnnnnnn 	arbitrary Unicode value;
        // may result in several code units 	code point U+nnnnnnnn
        $unicode1 = "abc\u0123def"
        $unicode2 = "abc\u01234567def"
        $notunicode = "abc\u0def"
    condition:
        any of them
}
