private rule my_private_rule
{
    condition:
        true
}

rule my_public_rule
{
    condition:
        my_private_rule
}
