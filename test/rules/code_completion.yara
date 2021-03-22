import "cuckoo"

rule ModuleCompletionExample
{
    meta:
        description = "Module Completion Example"
        author = "Test"
        reference = "https://infosec-intern.github.io"
    condition:
        cuckoo.
        cuckoo.network.
        foobar.
        pe.AGGRESIVE_WS_
        pe.character
}
