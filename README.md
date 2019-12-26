# linter-gcc

[![Join the chat at https://gitter.im/linter-gcc/Lobby](https://badges.gitter.im/linter-gcc/Lobby.svg)](https://gitter.im/linter-gcc/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.com/AtomLinter/linter-gcc.svg?branch=master)](https://travis-ci.com/AtomLinter/linter-gcc) [![apm](https://img.shields.io/apm/dm/linter-gcc.svg?style=flat-square)](https://atom.io/packages/linter-gcc)

This plugin provides an interface to gcc/g++ for linting and works with [Linter](https://github.com/AtomLinter/Linter).

Used with files with grammar "C", "C++" and ["C++14"](https://atom.io/packages/language-cpp14).

Includes linting **on-the-fly**, though it is only partially tested. Please open an issue if you encounter any problems.

## Important info for Mac OSX users!
If you have XCode installed on OSX, the `gcc/g++` commands will both link to `clang`. This can cause issues with the `-fmax-errors` option used by linter-gcc, which isn't recognised by clang. To properly install GCC, you need to install it with Homebrew (instructions [here](https://github.com/hebaishi/linter-gcc/issues/62)). You will likely also need to add the flag `-fsyntax-only` to your C Flags or C++ Flags.

## Linter in action!

![linter-gcc screenshot](https://raw.githubusercontent.com/hebaishi/images/master/lintergcc_onthefly.gif)

## Using CMake compile settings
linter-gcc can take compile settings from CMake. For example:

```bash
git clone https://github.com/hebaishi/gtf2tab
cd gtf2tab
mkdir build
cd build
cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=1 ..
```

Running ```cmake``` with the ```-DCMAKE_EXPORT_COMPILE_COMMANDS``` flag generates a ```compile_commands.json``` file which linter-gcc can get the compile settings from. Then you simply open the project in Atom, and enter ```./build/compile_commands.json``` in the Compile Commands File setting of linter-gcc. Note that if you supply a valid ```compile_commands.json``` file, your include paths and compile flags configuration settings (described below) are ignored.

Unfortunately, CMake does not typically compile header files so the ```compile_commands.json``` file does not include entries for these files. To add them you can use a tool like [compdb](https://github.com/Sarcasm/compdb).

```bash
compdb -p ./ list > compile_commands.json
```

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

Paths are expanded relative to the project that contains the file being linted. The package limits its search to 30 levels when looking for a configuration file. Within each project, you may have as many file/directory-specific configuration files as you wish.

### Usage notes:
* Add ```-fsyntax-only``` to your C/C++ compilation flags to prevent the generation of ```.gch``` files when linting headers
* Add ```-c``` to your flags to avoid linking errors.

### Plugin installation
Press ctrl and ',' or cmd and ',' , click on 'Packages', search 'linter gcc', or:
```
$ apm install linter-gcc
```
### Reporting Issues

Please read the [Wiki](https://github.com/AtomLinter/linter-gcc/wiki) before reporting any issues.
