/*
   Test multi-line comment
*/
// Test single-line comment
rule WildcardExample
{
    strings:
       $true = true
       $false = false
       $hex_string = { E2 34 ?? C8 A? FB }
       $sstring = 'single string'
       $dstring = "double string"
       sfalse falses strue trues

    condition:
       $hex_string
}