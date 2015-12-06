"use babel";

export default {
  config: {
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
    const regex = "(?<file>.+):(?<line>\\d+):(?<col>\\d+):\\s*\\w*\\s*(?<type>(error|warning|note)):\\s*(?<message>.*)";

    // Read configuration data from JSON file .gcc-config.json
    // in project root
    return {
      grammarScopes: ["source.c", "source.cpp"],
      scope: "file",
      lintOnFly: false,
      lint: (activeEditor) => {
        config = require("./config");
        var path = require('path');
        settings = config.settings();
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
        command = settings.execPath;

        // Expand path if necessary
        if (command.substring(0,1) == ".") {
            command = path.join(cwd, command);
        }

        args = [];

        if(activeEditor.getGrammar().name === "C++") {
          s = settings.gccDefaultCppFlags;
          tempargs = s.split(" ");
          args = args.concat(tempargs);
         } else if(activeEditor.getGrammar().name === "C") {
          s = settings.gccDefaultCFlags;
          tempargs = s.split(" ");
          args = args.concat(tempargs);
        }

        args.push(`-fmax-errors=${settings.gccErrorLimit}`);
        if(settings.gccSuppressWarnings) {
          args.push("-w");
        }

        var s = settings.gccIncludePaths;
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

        args.push(file);

        full_command = "linter-gcc: " + command;
        args.forEach(function(entry){
            full_command = full_command + " " + entry;
        });

        console.log(full_command);
        return helpers.exec(command, args, {stream: "stderr"}).then(output =>
          helpers.parse(output, regex)
        );
      }
    };
  }
};
