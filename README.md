![Source - https://raw.githubusercontent.com/blacktop/docker-yara/master/logo.png](./images/logo.png)

# textmate-yara
Syntax Highlighting and Snippets support for the YARA pattern matching language

Currently, Snippets support includes:
* A new file skeleton (or `rule:` skeleton)
* `import` statement completion
* `strings:` section skeleton
* `meta:` section skeleton

## Screenshot
![Image as of 04 Sept 2016](./images/04092016.PNG)

## Features

### Definition Provider and Peeking
Allows peeking and Ctrl+clicking to jump to a rule definition.
This only applies to rule names at the moment, but variables are in the works

![Go To Definition](./images/peek_rules.PNG)

### Reference Provider
Shows the locations of a given symbol (rule name, variable, constant, etc.)

![Find All References](./images/references.PNG)

## Problems?
If you encounter an issue with the syntax, feel free to create an issue or pull request!
Alternatively, check out some of the YARA syntaxes for Sublime and Textmate (i.e. those in the <b>Example Code</b> section below).
They use the same syntax engine as VSCode and should work the same way

## References
#### Syntax Reference:<br>
https://yara.readthedocs.io/

#### TextMate Docs:<br>
http://manual.macromates.com/en/language_grammars

#### Regular Expressions:<br>
http://www.regular-expressions.info/modifiers.html

#### Example Code:<br>
https://github.com/mmcgrana/textmate-clojure/blob/master/Syntaxes/Clojure.tmLanguage <br>
https://github.com/textmate/python.tmbundle/blob/master/Syntaxes/Python.tmLanguage <br>
https://github.com/nyx0/YaraSyntax/blob/master/yara.tmLanguage <br>
https://github.com/blacktop/language-yara