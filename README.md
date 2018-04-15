![Source - https://raw.githubusercontent.com/blacktop/docker-yara/master/logo.png](./images/logo.png)

# textmate-yara
Language support for the YARA pattern matching language

## Screenshot
![Image as of 04 Sept 2016](./images/04092016.PNG)

## Features

### Definition Provider and Peeking
Allows peeking and Ctrl+clicking to jump to a rule definition. This applies to both rule names and variables

![Go To Definition](./images/peek_rules.PNG)

### Reference Provider
Shows the locations of a given symbol (rule name, variable, constant, etc.)

![Find All References](./images/references.PNG)

### Code Completion
Provides completion suggestions for standard YARA modules, including `pe`, `elf`, `math`, and all the others available in the official documentation: http://yara.readthedocs.io/en/v3.7.0/modules.html

![Code Completion](./images/module_completion.PNG)

### Snippets
Includes:
* `rule:` skeleton
* `import` statement completion
* `strings:` section skeleton
* `meta:` section skeleton

## Problems?
If you encounter an issue with the syntax, feel free to create an issue or pull request!
Alternatively, check out some of the YARA syntaxes for Sublime and Atom, or the one bundled with YARA itself.
They use the same syntax engine as VSCode and should work the same way.

## YARA Documentation
https://yara.readthedocs.io/
