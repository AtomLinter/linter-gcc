# linter-gcc package
[![Build Status](https://travis-ci.org/hebaishi/linter-gcc.svg?branch=master)](https://travis-ci.org/hebaishi/linter-gcc)

Linter plugin for [Linter](https://github.com/AtomLinter/Linter), provides an interface to gcc/g++.

Used with files with grammar "C" and "C++".

Heavily modified fork of [linter-clang](https://github.com/AtomLinter/linter-clang) by [Kepler](https://github.com/k2b6s9j).

## Screenshot

![linter-gcc screenshot](https://github.com/hebaishi/images/blob/master/lintergcc-screenshot.png?raw=true)

## File/Project-Specific settings

Assuming you have the a file called ```sample.cpp``` open, linter-gcc performs the following actions:

1. Looks for file called ```sample.cpp.gcc-flags.json``` in the same directory as your source file (file-specific settings)
2. Looks for a file called ```.gcc-flags.json``` in every subdirectory from the current up to your project root (subdirectory/project-specific settings)
3. If no ```.gcc-flags.json``` is found, the settings in your configuration page are used.

The package takes its settings from the first configuration file that is found.

You can specify your settings in ```.gcc-flags.json```, at any level (file/subdirectory/project) using the following syntax:

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

In order to avoid unwanted behavior associated with having multiple projects open, only the paths within the first project are used, and the package limits its search to 30 levels when looking for a configuration file. You can work with multiple projects, as long as each is open in a separate window. Additionally, within each project, you may have as many file/directory-specific configuration files as you wish.

### Plugin installation
Press ctrl and ',' or cmd and ',' , click on 'Packages', search 'linter gcc', or:
```
$ apm install linter-gcc
```
### Debugging
The command executed by linter-gcc is written to the console on file save, so simply open the console to see the full command. Also, all attempts to find a valid configuration file are logged to the console. Please ensure that you have a working gcc/g++ compiler before submitting an issue.
