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
        $invalid = "C:\Users"
        $valid = "C:\\Users"
    condition:
        any of them
}
