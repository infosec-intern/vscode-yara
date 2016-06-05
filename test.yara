/*
   Test multi-line comment
*/
// Test single-line comment
rule WildcardExample
{
    strings:
       $hex_string = { E2 34 ?? C8 A? FB }

    condition:
       $hex_string
}