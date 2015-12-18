## 0.5.9
* Add compile flag to GCC command

## 0.5.8
* Add GCC to messages to play nice with linter-clang

## 0.5.7
* Add command-line error detection

## 0.5.6
* Beautify and add descriptions to package settings.

## 0.5.5
* Added unit tests for C source files

## 0.5.4
* Corrected error in package manifest

## 0.5.3
* Correctly atom-package-deps to manifest and main.js

## 0.5.2
* Removed atom-package-deps

## 0.5.1
* Added package-deps for automatic installation of base linter

## 0.5.0
* Added hierarchical configuration options
* Added unit tests for file/directory-specific settings

## 0.4.1
* Added build image to README.md

## 0.4.0
* Fixed leading space being added to message
* Added travis CI integration

## 0.3.9
* Fixed problem where fatal errors were ignored by the linter.
* Improved debugging output - full command printed directly.

## 0.3.8
* Fixed problem with parsing of multiple 'include paths' if some were empty.

## 0.3.7
* Fixed problem where an empty 'include paths' parameter prevented linting.

## 0.3.6
* Merge [Kepler](https://github.com/k2b6s9j)'s pull request to improve regex type capture

## 0.3.5
* Added descriptive keywords

## 0.3.4
* Updated description to be more search-friendly
* Re-ordered CHANGELOG.md so newest version is on top

## 0.3.3
* Fixed bug in getting file path

## 0.3.2
* Root folder is file path if no projects present

## 0.3.1
* Added relative path expansion to execPath parameter
* Added debug logging to console

## 0.3.0
* .gcc-flags.json now reloaded on file save
* Relative paths expanded with respect to project root

## 0.2.1
* Fixed .gcc-flags.json cache issue

## 0.2.0
* Added Screenshot to README
* Added project-specific settings

## 0.1.1
* Cleaned up settings taken from linter-clang

## 0.1.0 - First Release
* First Release - tested on Ubuntu x64, gcc and g++
