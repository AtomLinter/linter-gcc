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
  walkSync: function(dir, filelist) {
    var fs = fs || require('fs'),
    files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
      current_dir = dir + '/' + file
      if (fs.statSync(current_dir).isDirectory()) {
        filelist.push(current_dir)
        filelist = module.exports.walkSync(current_dir, filelist);
      }
    });
    return filelist;
  },
  grammarType(grammar_name) {
    if (grammar_name == "C"){
      return "C";
    } else if (grammar_name.indexOf("C++") != -1) {
      return "C++";
    } else {
      return undefined;
    }
  },
  getValidEditor: function(editor){
    if (!editor) return undefined;
    grammar = editor.getGrammar().name;
    if (!module.exports.grammarType(grammar)) {
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
    if (cwd) {
      return cwd
    } else {
      return ""
    }
  },
  getFileDir: function() {
    var filedir;
    editor = atom.workspace.getActivePaneItem();
    if (editor) {
      temp_file = editor.buffer.file;
      if (temp_file) {
        filedir = temp_file.getParent().getPath();
      }
    }
    return filedir;
  },
  removeOutputArgument: function(argument_list){
    output_list = []
    skip_flag = false
    argument_list.forEach(function(item){
      if (item == "-o"){
        skip_flag = true
      } else if (skip_flag) {
        skip_flag = false
      } else {
        output_list.push(item)
      }
    })
    return output_list

  },
  splitStringTrim: function(str, delim, expandPaths, itemPrefix){
    var pathm = require("path");
    output = [];
    if (!str) {
      return output;
    }
    str = str.trim();
    if (str.length == 0){
      return output;
    }
    temp_arr = require("split-string")(str, delim);
    temp_arr.forEach(function(item){
      item = item.trim();
      if (item.length > 0){
        if (item.substring(0, 1) == "." && expandPaths) {
          item = pathm.join(cwd, item);
        }
        else if (item.substring(0, 1) == "-" && expandPaths) {
          item = item.substring(1, item.length);
          item = pathm.join(module.exports.getFileDir(), item);
        }
        if (item.substring(item.length-2, item.length) == '/*' && expandPaths) {
          item = item.substring(0, item.length-2)
          var list = []
          dir_list = module.exports.walkSync(item, list)
          console.log("Expanding directories")
          dir_list.forEach(function(item){
            item = itemPrefix + item
            output.push(item)
          })
        }
        item = itemPrefix + item;
        output.push(item)
      }
    });
    return output;
  },
  buildCommand: function(activeEditor, file) {
    config = require("./config");
    var path = require('path');
    var fs = require('fs')
    settings = config.settings();

    if (atom.config.get("linter-gcc.gccDebug")){
      console.log("linter-gcc config: " + JSON.stringify(settings));
    }

    args = [];
    cwd = module.exports.getCwd();
    command = ""
    if (settings.compileCommandsFile.trim() != "") {
      commands_file = settings.compileCommandsFile.trim()
      commands_file = commands_file.trim()
      if (commands_file.substring(0, 1) == ".") {
        commands_file = path.join(cwd, commands_file);
      }
      console.log(commands_file)
      if (fs.existsSync(commands_file)) {

        delete require.cache[commands_file]
        try {
          compile_commands = require(commands_file)
          compile_commands.forEach(function(item) {
            if (item.file == file) {
              command_array = module.exports.splitStringTrim(item.command, " ", false, "")
              command = command_array[0]
              command_array.shift()
              command_array = module.exports.removeOutputArgument(command_array)
              args = args.concat(command_array)
            }
          })
        } catch (e) {
          console.log(e)
        }
      }
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

      var flags = "";
      grammar_type = module.exports.grammarType(activeEditor.getGrammar().name);
      if (grammar_type === "C++") {
        flags = settings.gccDefaultCppFlags;
      } else if (grammar_type === "C") {
        flags = settings.gccDefaultCFlags;
      }

      var flag_array = module.exports.splitStringTrim(flags, " ", false, "");
      args = args.concat(flag_array);

      if (settings.gccErrorLimit >= 0) {
        args.push(`-fmax-errors=${settings.gccErrorLimit}`);
      }
      if (settings.gccSuppressWarnings) {
        args.push("-w");
      }

      var include_paths = module.exports.splitStringTrim(settings.gccIncludePaths, ",", true, "-I");
      args = args.concat(include_paths);

      args.push(file);
    }

    if (atom.config.get("linter-gcc.gccDebug")){
      full_command = "linter-gcc: " + command;
      args.forEach(function(entry) {
        full_command = full_command + " " + entry;
      });
      console.log(full_command);
    }

    return {binary: command, args: args};
  }
}
