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
