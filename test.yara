/*
   Test multi-line comment
*/
// Test single-line comment
rule WildcardExample
{
    meta: // Useful meta information examples to add
 	    description = "Test"
        author = "Test""
        reference = "http://www.infosec-intern.com"
        os = "mswindows"
        filetype = "pe"
        maltype = "trojan"
        date = "2016-06"

    strings:
       $true = true
       $false = false
       $hex_string = { E2 34 ?? C8 A? FB }
       $sstring = 'single string'
       $dstring = "double string"
       $reg_ex = /md5: [0-9a-zA-Z]{32}/

    condition:
       $hex_string
       2 or all of them
}