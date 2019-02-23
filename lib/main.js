'use babel'

var time_last_lint = new Date().getTime();
var lint_waiting = false;

CompositeDisposable = require('atom').CompositeDisposable;

module.exports = {
  config: {
    execPath: {
      title: "GCC Executable Path",
      description: "Note for Windows/Mac OS X users: please ensure that GCC is in your ```$PATH``` otherwise the linter might not work. If your path contains spaces, it needs to be enclosed in double quotes.",
      type: "string",
      default: "g++",
      order : 1
    },
    gccDefaultCFlags: {
      title: "C Flags",
      description: "Supports the use of escaped characters",
      type: "string",
      default: "-c -Wall",
      order : 2
    },
    gccDefaultCppFlags: {
      title: "C++ Flags",
      description: "Supports the use of escaped characters",
      type: "string",
      default: "-c -Wall -std=c++11",
      order : 3
    },
    gccIncludePaths: {
      title: "GCC Include Paths",
      description: "Enter your include paths as a comma-separated list. Paths starting with ```.``` or ```..``` are expanded relative to the project root path and paths starting with a ```-``` are expanded relative to the path of the active file. If any of your paths contain spaces, they need to be enclosed in double quotes. To expand a directory recursively, add ```/*``` to the end of the path",
      type: "string",
      default: " ",
      order : 4
    },
    gccISystemPaths: {
      title: "GCC -isystem Include Paths",
      description: "Enter your include paths the same as above. These will be included using the -isystem option, treating the included files like system files and ignoring their warnings.",
      type: "string",
      default: " ",
      order : 5
    },
    gccErrorLimit: {
      title: "GCC Error Limit",
      description: "To completely remove `-fmax-errors`, simply enter `-1` here.",
      type: "integer",
      default: 0,
      order : 6
    },
    gccSuppressWarnings: {
      title: "Suppress GCC Warnings",
      type: "boolean",
      default: false,
      order : 7
    },
    gccErrorString: {
        title: "String GCC prepends to errors",
        type: "string",
        default: "error",
        order: 8
    },
    gccWarningString: {
        title: "String GCC prepends to warnings",
        type: "string",
        default: "warning",
        order: 9
    },
    gccNoteString: {
        title: "String GCC prepends to notes",
        type: "string",
        default: "note",
        order: 10
    },
    gccLintOnTheFly: {
      title: "Lint on-the-fly",
      description: "Please ensure any auto-saving packages are disabled before using this feature",
      type: "boolean",
      default: false,
      order : 11
    },
    gccLintOnTheFlyInterval: {
      title: "Lint on-the-fly Interval",
      description: "Time interval (in ms) between linting",
      type: "integer",
      default: 300,
      order : 12
    },
    gccRelintMessageSources: {
      title: "Re-lint message source files",
      description: "Reruns linter on files that contributed messages to the current working file",
      type: "boolean",
      default: false,
      order : 13
    },
    gccDebug: {
      title: "Show Debugging Messages",
      description: "Please read the linter-gcc wiki [here](https://github.com/hebaishi/linter-gcc/wiki) before reporting any issues.",
      type: "boolean",
      default: false,
      order : 14
    },
    gcc7orGreater: {
      title: "Gcc version 7 or newer",
      description: "Check if you have a Gcc version that recognizes \"-fdiagnostics-parseable-fixits\" (7 or newer)",
      type: "boolean",
      default: true,
      order : 15
    },
    compileCommandsFile: {
      title: "Compile commands file",
      description: "Path to cmake compile_commands.json",
      type: "string",
      default: "./build/compile_commands.json",
      order : 16
    }
  },

  messages: {},
  last_linted_files: {},
  linter_gcc: undefined,

  temp_file : {
    "C++": require("tempfile")(".cpp"),
    "C": require("tempfile")(".c")
  },

  lint: function(editor, linted_file, real_file){
    //create list of extra files to lint
    otherFiles = new Set([])
    if (atom.config.get("linter-gcc2.gccRelintMessageSources") == true){
      for (var file in module.exports.messages){
        if (!module.exports.messages.hasOwnProperty(file)) continue;
        var fileMessages = module.exports.messages[file];
        for (var msg in fileMessages){
          if (!fileMessages.hasOwnProperty(msg)) continue;
          var message = fileMessages[msg];
          if (message.location.file === real_file && file !== real_file && !module.exports.last_linted_files.has(file)){
            otherFiles.add(file);
          }
        }
      }
      for (let file of otherFiles){
        module.exports.lint(editor, file, file);
      }
    }
    module.exports.last_linted_files.add(real_file)
    command = require("./utility").buildCommand(editor, linted_file, real_file);
    return require("sb-exec").exec(command.binary, command.args, {stream: "stderr"}).then(output => {
      msgs = require("./utility.js").parse(output,editor)
      msgs.forEach(function(entry){
        if (entry.location.file === module.exports.temp_file["C"] || entry.location.file === module.exports.temp_file["C++"]){
          entry.location.file = real_file;
        }
        if (entry.severity ===`${atom.config.get("linter-gcc2.gccWarningString")}`)
            entry.severity = "warning";
        else if (entry.severity ===`${atom.config.get("linter-gcc2.gccErrorString")}`)
            entry.severity = "error";
        else if (entry.severity ===`${atom.config.get("linter-gcc2.gccNoteString")}`)
            entry.severity = "info";
      })

      //If parsing failed, return a general message if there was an error
      if (msgs.length == 0 && output.indexOf("error") != -1){
        msgs = [{
          severity: 'error',
          excerpt: output,
          location: {
              file: real_file,
              position: [[0, 0], [0, 0]]
          }
        }];
      }
      module.exports.messages[real_file] = msgs;
      // console.log(msgs)
      if (typeof module.exports.linter_gcc != "undefined"){
        module.exports.linter_gcc.setAllMessages(require("./utility").flattenHash(module.exports.messages))
      }
      return msgs;
    })
  },

  activate: function() {
    this.subscriptions = new CompositeDisposable()
    if(!atom.packages.getLoadedPackages("linter") && !atom.packages.getLoadedPackages("atom-ide-ui")) {
    atom.notifications.addError(
      "Linter and atom-ide-ui packages not found.",
      {
        detail: "Please install either the `linter` package or the `atom-ide-ui` package in your Settings view."
      }
    );
    }
    time_last_lint = new Date().getTime()
    lint_waiting = false
  },
  deactivate: function() {
    this.subscriptions.dispose()
  },
  consumeLinter: function(registerIndie) {
    module.exports.linter_gcc = registerIndie({
      name: 'GCC'
    })

    subs = this.subscriptions;
    utility = require("./utility")
    lintOnTheFly = function() {
      module.exports.last_linted_files = new Set([])
      editor = utility.getValidEditor(atom.workspace.getActiveTextEditor());
      if (!editor) return;
      if (atom.config.get("linter-gcc2.gccLintOnTheFly") == false) return;
      if (lint_waiting) return;
      lint_waiting = true
      interval = atom.config.get("linter-gcc2.gccLintOnTheFlyInterval")
      time_now = new Date().getTime()
      timeout = interval - (time_now - time_last_lint);
      setTimeout(
        function() {
          time_last_lint = new Date().getTime()
          lint_waiting = false
          grammar_type = utility.grammarType(editor.getGrammar().name)
          filename = String(module.exports.temp_file[grammar_type])
          require('fs-extra').outputFileSync(filename, editor.getText());
          module.exports.lint(editor, filename, editor.getPath());
        },
        timeout
      );
    };

    lintOnSave = function(){
      module.exports.last_linted_files = new Set([])
      editor = utility.getValidEditor(atom.workspace.getActiveTextEditor());
      if (!editor) return;
      if (atom.config.get("linter-gcc2.gccLintOnTheFly") == true) return;
      real_file = editor.getPath();
      //cleanup messages in this file created by linting other files
      if (atom.config.get("linter-gcc2.gccRelintMessageSources") == false){
        for (var file in module.exports.messages){
          if (!module.exports.messages.hasOwnProperty(file)) continue;
          var fileMessages = module.exports.messages[file];
          for (var msg in fileMessages){
            if (!fileMessages.hasOwnProperty(msg)) continue;
            var message = fileMessages[msg];
            if (message.location.file === real_file){
              delete fileMessages[msg];
            }
          }
        }
      }
      module.exports.lint(editor, real_file, real_file);
    };

    cleanupMessages = function(){
      editor_hash = {};
      atom.workspace.getTextEditors().forEach( function(entry){
        try{
          path = entry.getPath()
        } catch(err){
        }
        editor_hash[entry.getPath()] = 1;
      });
      for (var file in module.exports.messages){
        if (!editor_hash.hasOwnProperty(file)){
          delete module.exports.messages[file]
        }
      }
      module.exports.linter_gcc.setAllMessages(JSON.parse(JSON.stringify(require("./utility").flattenHash(module.exports.messages))));
    };

    subs.add(module.exports.linter_gcc)

    atom.workspace.observeTextEditors(function(editor) {
      subs.add(editor.onDidSave(lintOnSave))
      subs.add(editor.onDidStopChanging(lintOnTheFly))
      subs.add(editor.onDidDestroy(cleanupMessages))
    })
  }
}
