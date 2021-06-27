# Changelog

## [1.6.1] 2021-06-27
* Fixed grammar for escaped quotes in strings- previous change incorrectly treated escaped quotes as invalid

## [1.6.0] 2021-06-27
* Improved grammar matching for hex strings and quoted string escape sequences - invalid characters will be highlighted as such
* Converted TextMate grammar from XML to JSON format to improve readability
* Added hover provider to display hex strings in ASCII format

## [1.5.0] 2021-04-04
* Rule sections - especially the `meta:` section - now generated based on configuration
* Reorganized tests into multiple files to make them easier to read/find

## [1.4.1] 2021-03-25
* Renamed repository to vscode-yara
* Updated extension repository link

## [1.4.0] 2021-03-24
* Reworked module code completion to allow for arrays and dictionaries, and provide methods as snippet strings
* Added new keywords for operators `icontains`, `endswith`, `iendswith`, `startswith`, `istartswith` added in YARA v4.1.0
* Added additional snippets for basic file header conditions and updated existing snippets with modern syntax
* Added "vt" module code completion schema from @3c7

## [1.3.11] 2020-08-08
* Fixed Issue #32 - private rule definitions not recognized
* Updated dependencies

## [1.3.10] 2020-04-29
* Updated syntax to YARA version 4.0.0
* Updated module schema to YARA version 4.0.0

## [1.3.9] 2020-04-09
* Merged snippet improvements from @ITAYC0HEN
* Fixed reference provider regexp
* Updated dependencies

## [1.3.8] 2019-12-30
* Merged "fix import snippet" from @wesinator
* Updated dependencies

## [1.3.7] 2019-09-16
* Merged "Improve hex string begin matching" from @wesinator
* Updated dependencies

## [1.3.6] 2018-11-18
* Updated module schema to YARA version 3.8.1
* Updated dependencies

## [1.3.5] 2018-07-29
* Merged XML validation fix from @wesinator

## [1.3.4] 2018-06-13
* Fixed 'date' string value in metadata and updated packages

## [1.3.3] 2018-06-07
* Fixed regexp syntax highlighting

## [1.3.2] 2018-05-29
* Added modified rule snippet and new snippets for 'for' loop

## [1.3.1] 2018-04-29
* Reorganized code base for clarity; no new features/fixes

## [1.3.0] 2018-04-13
* Added module code completion

## [1.2.4] 2018-03-20
* Addressed problem raised in Issue #21: "Greedy regex"
* Added 'xor' keyword string (Thanks to wesinator)

## [1.2.3] 2018-02-27
* Added reference support for wildcard symbols in local rule scope

## [1.2.2] 2018-02-18
* Added variable definition feature

## [1.2.1] 2018-02-13
* Addressed problem raised in Issue #17: "Reference Provider has trouble with certain string variables"

## [1.2.0] 2018-02-12
* Added definition and reference providers along with some basic unit tests

## [1.1.2] 2018-01-27
* Fixed normal string regex to perform non-greedy search (Thanks to samtatasurya)
* Added this CHANGELOG

[1.1.2]: https://github.com/infosec-intern/vscode-yara/commit/7640cadc9db8f2b5087b2fecc7c5fc3f1741c011
[1.2.0]: https://github.com/infosec-intern/vscode-yara/commit/0ad1cb401758165bf4d5d43f3a549d386f6b1fd6
[1.2.1]: https://github.com/infosec-intern/vscode-yara/commit/5d29c34f73c210c478fabf1548a7067735b0eedf
[1.2.2]: https://github.com/infosec-intern/vscode-yara/commit/01c9a4c9b7795494488bacab20cacec9a83e67d3
[1.2.3]: https://github.com/infosec-intern/vscode-yara/commit/e2ecae2efaf91012b6dd71bc328597beb83ef7fa
[1.2.4]: https://github.com/infosec-intern/vscode-yara/commit/00e44d92dedd0fc9001a8458d001e274489abe5c
[1.3.0]: https://github.com/infosec-intern/vscode-yara/commit/94a1dffe16df543a2c46eae0f3c04ffb5e06d659
[1.3.1]: https://github.com/infosec-intern/vscode-yara/commit/955bbbaa078bc3875e07468d864b94479c2652d3
[1.3.2]: https://github.com/infosec-intern/vscode-yara/commit/a047c27bab68deac6910dd440d3e6aaad005e33a
[1.3.3]: https://github.com/infosec-intern/vscode-yara/commit/e94c3ec33f306e762c0e4a2d6c12268a9e9dcc4a
[1.3.4]: https://github.com/infosec-intern/vscode-yara/commit/c36207d619cfa6df7623cb4e2419140c7cc400d4
[1.3.5]: https://github.com/infosec-intern/vscode-yara/commit/484f38b89b96b52cfc89b8e33166e3557974fa13
[1.3.6]: https://github.com/infosec-intern/vscode-yara/commit/3c8b2a4ac394542142e6c08b5bdc453de2e40cd9
[1.3.7]: https://github.com/infosec-intern/vscode-yara/commit/75855ac8d26605a2043e169f7c53e29f203f6f99
[1.3.8]: https://github.com/infosec-intern/vscode-yara/commit/27cb613b3450317afe03617c8cae96610e04ac6e
[1.3.9]: https://github.com/infosec-intern/vscode-yara/commit/893073684743990777306da581688f9158e41179
[1.3.10]: https://github.com/infosec-intern/vscode-yara/commit/af9dbb055f0213064740a1184f95226d23a089b6
[1.3.11]: https://github.com/infosec-intern/vscode-yara/commit/9831637d1632e89fb45e3cff2975867740005f13
[1.4.0]: https://github.com/infosec-intern/vscode-yara/compare/v1.3.11...v1.4.0
[1.4.1]: https://github.com/infosec-intern/vscode-yara/compare/v1.4.0...v1.4.1
[1.5.0]: https://github.com/infosec-intern/vscode-yara/compare/v1.4.1...v1.5.0
[1.6.0]: https://github.com/infosec-intern/vscode-yara/compare/v1.5.0...v1.6.0
[1.6.1]: https://github.com/infosec-intern/vscode-yara/compare/v1.6.0...v1.6.1
