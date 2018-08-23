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

      var isystem_include_paths = module.exports.splitStringTrim(settings.gccISystemPaths, ",", true, "-isystem");
      args = args.concat(isystem_include_paths);

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
  },
  parse: function(data,editor) {

    if (typeof data !== 'string') {
      throw new Error('Invalid or no `data` provided');
    }

    var  NamedRegexp = require('named-js-regexp');
    var options = {flags: "g"}
    const regex = `(?<file>.+):(?<line>\\d+):(?<col>\\d+):\\s*\\w*\\s*(?<type>(${atom.config.get("linter-gcc.gccErrorString")}|${atom.config.get("linter-gcc.gccWarningString")}|${atom.config.get("linter-gcc.gccNoteString")}))\\s*:\\s*(?<message>.*)`
    var compiledRegexp = new NamedRegexp(regex, options.flags);
    var rawMatch = compiledRegexp.exec(data);

    var messages = [];
    while (rawMatch !== null) {
      var match = rawMatch.groups();
      var type = match.type;
      var text = match.message;
      var file = match.file || options.filePath || null;

      var lineStart = parseInt(match.line || 1) - 1;
      var colStart = parseInt(match.col || 1) - 1;
      var lineEnd = lineStart;

        var colEnd = colStart + 1;

      var duplicate = false;
      messages.forEach(function(msg){
        duplicate = duplicate || (msg.severity === type && msg.location.file === file
                                  && msg.location.position[0][0] === lineStart
                                  && msg.location.position[0][1] === colStart);
      })

      if (!duplicate) {
        messages.push({
          severity: type,
          excerpt: text,
          location:{
              file: file,
              position: [[lineStart, colStart], [lineEnd, colEnd]]
          }
        });
      }

      rawMatch = compiledRegexp.exec(data);
    }

    return messages;
  }
}
