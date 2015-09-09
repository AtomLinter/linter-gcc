"use babel";

export default {
  config: {
    // It should be noted that I, Kepler, hate these Config names. However these
    //  are the names in use by many people. Changing them for the sake of clean
    //  of clean code would cause a mess for our users. Because of this we
    //  override the titles the editor gives them in the settings pane.
    execPath: {
      type: "string",
      default: "/usr/bin/g++"
    },
    gccIncludePaths: {
      type: "string",
      default: " "
    },
    gccSuppressWarnings: {
      type: "boolean",
      default: false
    },
    gccDefaultCFlags: {
      type: "string",
      default: "-Wall"
    },
    gccDefaultCppFlags: {
      type: "string",
      default: "-Wall -std=c++11"
    },
    gccErrorLimit: {
      type: "integer",
      default: 0
    }
  },

  activate: () => {
    // Because all four of the languages this linter supports have grammmars
    //  have grammmars built into the editor we do not need to throw errors when
    //  one any one of the lanugages isn't installed. If a user has the grammar
    //  disabled that is a choice they have made.

    // Show the user an error if they do not have an appropriate linter base
    //  package installed from Atom Package Manager. This will not be an issues
    //  after a base linter package is integrated into Atom, in the comming
    //  months.
    // TODO: Remove when Linter Base is integrated into Atom.

    atom.project.onDidChangePaths(require("./config").settings );
    fileConfig = require("./config");
    fileConfig.settings();
    if(!atom.packages.getLoadedPackages("linter")) {
      atom.notifications.addError(
        "Linter package not found.",
        {
          detail: "Please install the `linter` package in your Settings view."
        }
      );
    }
  },

  provideLinter: () => {
    const helpers = require("atom-linter");
    const regex = "(?<file>.+):(?<line>\\d+):(?<col>\\d+): (?<type>[\\w \\-]{5,9}):[ -]+(?<message>.*)";

    // Read configuration data from JSON file .gcc-config.json
    // in project root
    return {
      grammarScopes: ["source.c", "source.cpp"],
      scope: "file",
      lintOnFly: false,
      lint: (activeEditor) => {
        fileConfig = require("./config");
        var path = require('path');
        fileConfig.settings();
        var file = activeEditor.getPath();
        var cwd = atom.project.getPaths()[0]
        if (!cwd) {
            editor = atom.workspace.getActivePaneItem();
            if (editor) {
                file = editor.buffer.file;
                if (file) {
                    cwd = file.getParent().getPath();
                }
            }
        }
        command = atom.config.get("linter-gcc.execPath");

        // Expand path if necessary
        if (command.substring(0,1) == ".") {
            command = path.join(cwd, command);
        }

        args = [];
        // const args = ["-fsyntax-only",
        //   "-fno-caret-diagnostics",
        //   "-fno-diagnostics-fixit-info",
        //   "-fdiagnostics-print-source-range-info",
        //   "-fexceptions"];
        //
        if(activeEditor.getGrammar().name === "C++") {
          //const language = "c++";
          s = atom.config.get("linter-gcc.gccDefaultCppFlags");
          tempargs = s.split(" ");
          args = args.concat(tempargs);
        }
        // if(activeEditor.getGrammar().name === "Objective-C++") {
        //   //const language = "objective-c++";
        //   args.push("-xobjective-c++");
        //   args.push(atom.config.get("linter-gcc.gccDefaultObjCppFlags"));
        // }
        if(activeEditor.getGrammar().name === "C") {
          //const language = "c";
          s = atom.config.get("linter-gcc.gccDefaultCFlags");
          tempargs = s.split(" ");
          args = args.concat(tempargs);
        }
        // if(activeEditor.getGrammar().name === "Objective-C") {
        //   //const language = "objective-c";
        //   args.push("-xobjective-c");
        //   args.push(atom.config.get("linter-gcc.gccDefaultObjCFlags"));
        // }
        //
        args.push(`-fmax-errors=${atom.config.get("linter-gcc.gccErrorLimit")}`);
        if(atom.config.get("linter-gcc.gccSuppressWarnings")) {
          args.push("-w");
        }
        // if(atom.config.get("linter-gcc.verboseDebug")) {
        //   args.push("--verbose");
        // }
        //
        var s = atom.config.get("linter-gcc.gccIncludePaths");
        s = s.trim();
        if (s.length !=  0) {
            tempargs = s.split(",");
            tempargs.forEach(function(entry) {
                entry = entry.trim();
                if (entry.length != 0) {
                    if (entry.substring(0,1) == ".") {
                        entry = path.join(cwd, entry);
                    }
                    item = "-I" + entry;
                    args.push(item);
                }
            });
        }
        //
        // New set of arguments
        args.push(file);
        console.log(command);
        console.log(args);

        return helpers.exec(command, args, {stream: "stderr"}).then(output =>
          helpers.parse(output, regex)
        );
      }
    };
  }
};
