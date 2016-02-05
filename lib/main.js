'use babel'

import {
  CompositeDisposable
}
from 'atom'

module.exports = {
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
      default: "-c -Wall"
    },
    gccDefaultCppFlags: {
      title: "C++ Flags",
      type: "string",
      default: "-c -Wall -std=c++11"
    },
    gccLintOnTheFly: {
      title: "Lint on-the-fly",
      description: "Please ensure any auto-saving packages are disabled before using this feature",
      type: "boolean",
      default: false
    },
    gccErrorLimit: {
      title: "GCC Error Limit",
      type: "integer",
      default: 0
    }
  },

  messages: {},
  linter_gcc: undefined,

  temp_file : require("tempfile")(".cpp"),

  lint: function(editor, linted_file, real_file){
    const helpers=require("atom-linter");
    const regex = "(.+):(?<line>\\d+):(?<col>\\d+):\\s*\\w*\\s*(?<type>(error|warning|note)):\\s*(?<message>.*)"
    command = require("./utility").buildCommand(editor, linted_file);
    console.log("command: " + command)
    return helpers.exec(command.binary, command.args, {stream: "stderr"}).then(output => {
      msgs = helpers.parse(output, regex)
      msgs.forEach(function(entry){
        entry.filePath = real_file;
      })
      module.exports.messages[real_file] = msgs;
      if (typeof module.exports.linter_gcc != "undefined"){
        module.exports.linter_gcc.setMessages(require("./utility").flattenHash(module.exports.messages))

      }
      console.log("msgs" + msgs)
      return msgs;
    })
  },

  activate: function() {
    this.subscriptions = new CompositeDisposable()
  },
  deactivate: function() {
    this.subscriptions.dispose()
  },
  getValidEditor: function(editor){
    if (!editor) return undefined;
    grammar = editor.getGrammar().name;
    if (!(grammar == "C" || grammar == "C++")) {
      return undefined;
    }
    return editor;
  },
  consumeLinter: function(indieRegistry) {
    module.exports.linter_gcc = indieRegistry.register({
      name: 'GCC'
    })

    subs = this.subscriptions;

    lintOnTheFly = function() {
      editor = module.exports.getValidEditor(atom.workspace.getActiveTextEditor());
      if (!editor) return;
      if (atom.config.get("linter-gcc.gccLintOnTheFly") == false) return;
      require('fs-extra').outputFileSync(module.exports.temp_file, editor.getText());
      module.exports.lint(editor, module.exports.temp_file, editor.getPath());
    };

    lintOnSave = function(){
      editor = module.exports.getValidEditor(atom.workspace.getActiveTextEditor());
      if (!editor) return;
      if (atom.config.get("linter-gcc.gccLintOnTheFly") == true) return;
      real_file = editor.getPath();
      module.exports.lint(editor, real_file, real_file);
    };

    cleanupMessages = function(){
      editor_hash = {};
      console.log("Editor paths");
      atom.workspace.getTextEditors().forEach( function(entry){
        try{
          path = entry.getPath()
        } catch(err){
        }
        console.log(path)
        editor_hash[entry.getPath()] = 1;
      });
      console.log("Messages paths");
      for (var file in module.exports.messages){
        console.log(file)
        if (!editor_hash.hasOwnProperty(file)){
          delete module.exports.messages[file]
        }
      }
      module.exports.linter_gcc.setMessages( require("./utility").flattenHash(module.exports.messages) );
    };

    subs.add(module.exports.linter_gcc)

    atom.workspace.observeTextEditors(function(editor) {
      subs.add(editor.onDidSave(lintOnSave))
      subs.add(editor.onDidStopChanging(lintOnTheFly))
      subs.add(editor.onDidDestroy(cleanupMessages))
    })
  }
}
