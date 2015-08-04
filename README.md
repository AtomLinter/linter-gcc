# linter-gcc package

Linter plugin for [Linter](https://github.com/AtomLinter/Linter), provides an interface to gcc/g++.

Used with files with grammar "C" and "C++".

Clone of [linter-clang](https://github.com/AtomLinter/linter-clang) by Kepler.

## Screenshot

![linter-gcc screenshot](https://github.com/hebaishi/images/blob/master/lintergcc-screenshot.png?raw=true)

## Project-Specific settings

Just place a file called ```.gcc-flags.json``` in your project root, with the following content:

```json
{
  "execPath": "/usr/bin/g++",
  "gccDefaultCFlags": "-Wall",
  "gccDefaultCppFlags": "-Wall -std=c++11",
  "gccErrorLimit": 15,
  "gccIncludePaths": ".,./include,./path",
  "gccSuppressWarnings": true
}
```
Note that the include paths need to be separated by commas. If this file is present, it will replace the settings you specified in the settings window. Relative paths (starting with ```.``` or ```..```) are expanded with respect to project root.

Currently, this only works for the first project folder you have. The JSON file gets reloaded every time you add/remove a project folder.

### Plugin installation
Press ctrl and ',' or cmd and ',' , click on 'Packages', search 'linter gcc', or:
```
$ apm install linter-gcc
```
