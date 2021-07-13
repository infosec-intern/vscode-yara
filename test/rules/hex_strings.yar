// https://yara.readthedocs.io/en/stable/writingrules.html#hexadecimal-strings
rule silent_banker : banker
{
    meta:
        description = "This is just an example"
        threat_level = 3
        in_the_wild = true
    strings:
        $a = {6A 40 68 00 30 00 00 6A 14 8D 91}
        $b = {8D 4D B0 2B C1 83 C0 27 99 6A 4E 59 F7 F9}
        $c = "UVODFRYSIHLNWPEJXQZAKCBGMT"
    condition:
        $a or $b or $c
}
rule WildcardExample
{
    strings:
        $hex_string = { E2 34 ?? C8 A? FB }

    condition:
        any of them
}
rule JumpExample
{
    strings:
        $hex_string = { F4 23 [4-6] 62 B4 }
        $ = {F4 23 01 02 03 04 62 B4}
        $ = {F4 23 00 00 00 00 00 62 B4}
        $ = {F4 23 15 82 A3 04 45 22 62 B4}
        $ = {FE 39 45 [0-8] 89 00}
        $ = {FE 39 45 [23-45] 89 00}
        $ = {FE 39 45 [1000-2000] 89 00}
        $invalid = {FE 39 45 [10-7] 89 00}
        $ = {FE 39 45 [6] 89 00}
        $ = {FE 39 45 [6-6] 89 00}
        $ = {FE 39 45 ?? ?? ?? ?? ?? ?? 89 00}
        $ = {FE 39 45 [10-] 89 00}
        $ = {FE 39 45 [-] 89 00}
    condition:
        all of them
}
rule AlternativesExample1
{
    strings:
        $hex_string = { F4 23 ( 62 B4 | 56 ) 45 }

    condition:
        any of them
}
rule AlternativesExample2
{
    strings:
        $hex_string = { F4 23 ( 62 B4 | 56 | 45 ?? 67 ) 45 }
        $hex_string2 = {F423(62B4|56|45??67)45}
        $webshell = { 24 5f (47 45|50 4f 53) 54 5b (27|22) 63 6d 64 (27|22) 5d }
        $missing_closed_parens = { F4 23 ( 62 B4 | 56 | 45 ?? 67  45 }
        $missing_open_parens = { F4 23 62 B4 | 56 | 45 ?? 67 ) 45 }
    condition:
        any of them
}
rule HexStringWithComments {
    strings:
        $hex_string = {
            AA BB       // embedded single comment
            CC EE       /* embedded multi comment */
        }
    condition:
        any of them
}
