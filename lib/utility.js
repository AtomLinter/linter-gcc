module.exports = {
  flattenHash: function(obj){
    var array = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)){
        obj[key].forEach( function(entry){
          array.push(entry);
        });
      }
    }
    return array;
  },
  getValidEditor: function(editor){
    if (!editor) return undefined;
    grammar = editor.getGrammar().name;
    if (!(grammar === "C" || grammar === "C++" || grammar === "C++14")) {
      return undefined;
    }
    return editor;
  },
  getCwd: function() {
    var cwd = atom.project.getPaths()[0]
    if (!cwd) {
      editor = atom.workspace.getActivePaneItem();
      if (editor) {
        temp_file = editor.buffer.file;
        if (temp_file) {
          cwd = temp_file.getParent().getPath();
        }
      }
    }
    return cwd;
  },
  buildCommand: function(activeEditor, file) {
    config = require("./config");
    var path = require('path');
    settings = config.settings();
    cwd = module.exports.getCwd();
    command = settings.execPath;

    // Expand path if necessary
    if (command.substring(0, 1) == ".") {
      command = path.join(cwd, command);
    }

    // Cross-platform $PATH expansion
    command = require("shelljs").which(command);
    if (!command) {
      atom.notifications.addError(
        "linter-gcc: Executable not found", {
          detail: "\"" + settings.execPath + "\" not found"
        }
      );
      console.log("linter-gcc: \"" + settings.execPath + "\" not found");
      return;
    }

    args = [];
    var flags = "";
    grammar_name = activeEditor.getGrammar().name;
    if (grammar_name === "C++" || grammar_name === "C++14") {
      flags = settings.gccDefaultCppFlags;
    } else if (grammar_name === "C") {
      flags = settings.gccDefaultCFlags;
    }

    var tempargs = flags.split(" ");
    tempargs.forEach(function(entry) {
      entry = entry.trim();
      if (entry.length > 0) {
        args.push(entry);
      }
    });

    args.push(`-fmax-errors=${settings.gccErrorLimit}`);
    if (settings.gccSuppressWarnings) {
      args.push("-w");
    }

    var s = settings.gccIncludePaths;
    s = s.trim();
    if (s.length != 0) {
      tempargs = s.split(",");
      tempargs.forEach(function(entry) {
        entry = entry.trim();
        if (entry.length != 0) {
          if (entry.substring(0, 1) == ".") {
            entry = path.join(cwd, entry);
          }
          item = "-I" + entry;
          args.push(item);
        }
      });
    }

    args.push(file);

    full_command = "linter-gcc: " + command;
    args.forEach(function(entry) {
      full_command = full_command + " " + entry;
    });

    console.log(full_command);
    return {binary: command, args: args};
  }
}
