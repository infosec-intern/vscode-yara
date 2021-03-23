import "cuckoo"
import "pe"
import "time"
import "dotnet"

rule ModuleCompletionExample
{
    meta:
        description = "Module Completion Example"
        author = "Test"
        reference = "https://infosec-intern.github.io"
    condition:
        time.
        cuckoo.network.
        foobar.
        pe.AGGRESIVE_WS_
        pe.character
        pe.version_in
        dotnet.guids
        pe.data_director
}
