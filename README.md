# linter-gcc package

Linter plugin for [Linter](https://github.com/AtomLinter/Linter), provides an interface to gcc/g++.

Used with files with grammar "C" and "C++".

Clone of [linter-clang](https://github.com/AtomLinter/linter-clang) by [Kepler](https://github.com/k2b6s9j).

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
Note that the include paths need to be separated by commas. If this file is present, it will replace the settings you specified in the settings window. Relative paths (starting with ```.``` or ```..```) are expanded with respect to the root folder. Both ```execPath``` and ```gccIncludePaths``` are expanded.

If you have atleast one project open, the root folder will the root folder of the first (top) project. Otherwise, the path to the current file is taken as the root.

### Plugin installation
Press ctrl and ',' or cmd and ',' , click on 'Packages', search 'linter gcc', or:
```
$ apm install linter-gcc
```
### Debugging
Executable path and all arguments are written to the console on file save, so just open the console to see the values of these parameters.
