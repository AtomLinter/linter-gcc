'use babel'

CompositeDisposable = require('atom').CompositeDisposable;

module.exports = {
  config: {
    execPath: {
      title: "GCC Executable Path",
      description: "Note for Windows/Mac OSX users: please ensure that GCC is in your ```$PATH``` otherwise the linter might not work. If your path contains spaces, it needs to be enclosed in double quotes.",
      type: "string",
      default: "/usr/bin/g++",
      order : 1
    },
    gccDefaultCFlags: {
      title: "C Flags",
      description: "Supports the use of espcaped characters",
      type: "string",
      default: "-c -Wall",
      order : 2
    },
    gccDefaultCppFlags: {
      title: "C++ Flags",
      description: "Supports the use of espcaped characters",
      type: "string",
      default: "-c -Wall -std=c++11",
      order : 3
    },
    gccIncludePaths: {
      title: "GCC Include Paths",
      description: "Enter your include paths as a comma-separated list. Paths starting with ```.``` or ```..``` are expanded relative to the project root/file path. If any of your paths contain spaces, they need to be enclosed in double quotes.",
      type: "string",
      default: " ",
      order : 4
    },
    gccErrorLimit: {
      title: "GCC Error Limit",
      type: "integer",
      default: 0,
      order : 5
    },
    gccSuppressWarnings: {
      title: "Suppress GCC Warnings",
      type: "boolean",
      default: false,
      order : 6
    },
    gccLintOnTheFly: {
      title: "Lint on-the-fly",
      description: "Please ensure any auto-saving packages are disabled before using this feature",
      type: "boolean",
      default: false,
      order : 7
    },
    gccDebug: {
      title: "Show Debugging Messages",
      description: "Please read the linter-gcc wiki [here](https://github.com/hebaishi/linter-gcc/wiki) before reporting any issues.",
      type: "boolean",
      default: false,
      order : 8
    }
  },

  messages: {},
  linter_gcc: undefined,

  temp_file : {
    "C++": require("tempfile")(".cpp"),
    "C": require("tempfile")(".c")
  },

  lint: function(editor, linted_file, real_file){
    const helpers=require("atom-linter");
    const regex = "(?<file>.+):(?<line>\\d+):(?<col>\\d+):\\s*\\w*\\s*(?<type>(error|warning|note)):\\s*(?<message>.*)"
    command = require("./utility").buildCommand(editor, linted_file);
    return helpers.exec(command.binary, command.args, {stream: "stderr"}).then(output => {
      msgs = helpers.parse(output, regex)
      msgs.forEach(function(entry){
        if (entry.filePath === module.exports.temp_file["C"] || entry.filePath === module.exports.temp_file["C++"]){
          entry.filePath = real_file;
        }
      })
      if (msgs.length == 0 && output.indexOf("error") != -1){
        msgs = [{
          type: 'error',
          text: output,
          filePath: real_file
        }];
      }
      module.exports.messages[real_file] = msgs;
      // console.log(msgs)
      if (typeof module.exports.linter_gcc != "undefined"){
        module.exports.linter_gcc.setMessages(JSON.parse(JSON.stringify(require("./utility").flattenHash(module.exports.messages))))
      }
      return msgs;
    })
  },

  activate: function() {
    this.subscriptions = new CompositeDisposable()
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
  deactivate: function() {
    this.subscriptions.dispose()
  },
  consumeLinter: function(indieRegistry) {
    module.exports.linter_gcc = indieRegistry.register({
      name: 'GCC'
    })

    subs = this.subscriptions;
    utility = require("./utility")
    lintOnTheFly = function() {
      editor = utility.getValidEditor(atom.workspace.getActiveTextEditor());
      if (!editor) return;
      if (atom.config.get("linter-gcc.gccLintOnTheFly") == false) return;
      grammar_type = utility.grammarType(editor.getGrammar().name)
      filename = String(module.exports.temp_file[grammar_type])
      require('fs-extra').outputFileSync(filename, editor.getText());
      module.exports.lint(editor, filename, editor.getPath());
    };

    lintOnSave = function(){
      editor = utility.getValidEditor(atom.workspace.getActiveTextEditor());
      if (!editor) return;
      if (atom.config.get("linter-gcc.gccLintOnTheFly") == true) return;
      real_file = editor.getPath();
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
      module.exports.linter_gcc.setMessages(JSON.parse(JSON.stringify(require("./utility").flattenHash(module.exports.messages))));
    };

    subs.add(module.exports.linter_gcc)

    atom.workspace.observeTextEditors(function(editor) {
      subs.add(editor.onDidSave(lintOnSave))
      subs.add(editor.onDidStopChanging(lintOnTheFly))
      subs.add(editor.onDidDestroy(cleanupMessages))
    })
  }
}
