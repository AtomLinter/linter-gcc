"use babel";

export default {
  config: {
    execPath: {
      title: "GCC Executable Path",
      description: "Note for Windows/Mac OSX users: please ensure that GCC is in your ```$PATH``` otherwise the linter might not work. If your path contains spaces, it needs to be enclosed in double quotes.",
      type: "string",
      default: "/usr/bin/g++"
    },
    gccIncludePaths: {
      title: "GCC Include Paths",
      description: "Enter your include paths as a comma-separated list. Paths starting with ```.``` or ```..``` are expanded relative to the project root/file path. If any of your paths contain spaces, they need to be enclosed in double quotes.",
      type: "string",
      default: " "
    },
    gccSuppressWarnings: {
      title: "Suppress GCC Warnings",
      type: "boolean",
      default: false
    },
    gccDefaultCFlags: {
      title: "C Flags",
      type: "string",
      default: "-Wall"
    },
    gccDefaultCppFlags: {
      title: "C++ Flags",
      type: "string",
      default: "-Wall -std=c++11"
    },
    gccErrorLimit: {
      title: "GCC Error Limit",
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
    require("atom-package-deps").install("linter-gcc");
  },

  provideLinter: () => {
    const helpers = require("atom-linter");
    const regex = "(?<file>.+):(?<line>\\d+):(?<col>\\d+):\\s*\\w*\\s*(?<type>(error|warning|note)):\\s*(?<message>.*)";

    // Read configuration data from JSON file .gcc-config.json
    // in project root
    return {
      name: "GCC",
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
        args.push("-c");

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
          {
              messages = helpers.parse(output, regex);
              var searchString = "error";
              var error_pos = output.indexOf(searchString);
              if (messages.length == 0) {
                  if (error_pos != -1) {
                      messages.push({
                          type: "error",
                          text: output.substring(error_pos, output.length - 1)
                      });
                  }
              }
              return messages;
          }
        );
      }
    };
  }
};
