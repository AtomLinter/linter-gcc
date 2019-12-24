var compile_commands_last_modified = 0;
var compile_commands = {};

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
    var cwd;
    editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      temp_file_path = editor.getPath();
      if (temp_file_path) {
        cwd = atom.project.relativizePath(temp_file_path)[0]
      }
    } else {
      cwd = atom.project.getPaths()[0]
    }

    if (cwd) {
      return cwd
    } else {
      return ""
    }
  },
  getFileDir: function() {
    var filedir;
    editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      buffer = editor.buffer;
      if (buffer) {
        temp_path = buffer.file;
        if (temp_path)
          filedir = temp_path.getParent().getPath();
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
  buildCommand: function(activeEditor, file, real_file) {
    config = require("./config");
    var path = require('path');
    var fs = require('fs')
    settings = config.settings();

    if (atom.config.get("linter-gcc2.gccDebug")){
      console.log("linter-gcc2 config: " + JSON.stringify(settings));
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
      if (atom.config.get("linter-gcc2.gccDebug")){
        console.log(commands_file)
      }
      if (fs.existsSync(commands_file)) {
        commands_file_stats = fs.statSync(commands_file);
        if (commands_file_stats.mtime.getTime() > compile_commands_last_modified)
        {
          compile_commands_last_modified = commands_file_stats.mtime.getTime()
          try {
            compile_commands = JSON.parse(fs.readFileSync(commands_file));
          } catch (e) {
            console.log(e)
          }
        }

        try {
          compile_commands.forEach(function(item) {
            if (item.file == real_file) {
              command_array = module.exports.splitStringTrim(item.command, " ", false, "")
              command = command_array[0]
              command_array.shift()
              command_array = module.exports.removeOutputArgument(command_array)
              args = args.concat(command_array)
              if (atom.config.get("linter-gcc2.gccLintOnTheFly") == true) {
                args.push("-iquote" + path.dirname(real_file));
                for (i = 0; i < args.length; i++) {
                  if (args[i] == real_file) {
                    args[i] = file;
                  }
                }
              }
            }
          })
        } catch (e) {
          console.log(e)
        }
      }
      /* Only override command from settings if compile_commands.json didn't provide one */
      if (command == "")
        command = settings.execPath;

      // Expand path if necessary
      if (command.substring(0, 1) == ".") {
        command = path.join(cwd, command);
      }

      // Cross-platform $PATH expansion
      command = require("shelljs").which(command);
      if (!command) {
        atom.notifications.addError(
          "linter-gcc2: Executable not found", {
            detail: "\"" + settings.execPath + "\" not found"
          }
        );
        console.log("linter-gcc2: \"" + settings.execPath + "\" not found");
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

      if (atom.config.get("linter-gcc2.gccLintOnTheFly") == true) {
        args.push("-iquote" + path.dirname(real_file));
      }

      args.push(file);
    }

    if (atom.config.get("linter-gcc2.gccDebug")){
      full_command = "linter-gcc2: " + command;
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

    if (settings.gcc7orGreater) {
      var regex = `(?<file>.+):(?<line>\\d+):(?<col>\\d+):\\s*\\w*\\s*(?<type>(${atom.config.get("linter-gcc2.gccErrorString")}|${atom.config.get("linter-gcc2.gccWarningString")}|${atom.config.get("linter-gcc2.gccNoteString")}))\\s*:\\s*(?<message>.*)(\\r?\\n(?<code>.*)\\r?\\n(?<placemarks>\\s+\\^~*))*`
    }
    else
    {
      var regex = `(?<file>.+):(?<line>\\d+):(?<col>\\d+):\\s*\\w*\\s*(?<type>(${atom.config.get("linter-gcc2.gccErrorString")}|${atom.config.get("linter-gcc2.gccWarningString")}|${atom.config.get("linter-gcc2.gccNoteString")}))\\s*:\\s*(?<message>.*)`
    }
    var compiledRegexp = new NamedRegexp(regex, options.flags);
    var rawMatch = compiledRegexp.exec(data);

    var messages = [];
    while (rawMatch !== null) {
      var match = rawMatch.groups();
      var type = match.type;
      var text = match.message;
      var file = match.file;
      if (file.includes("<") || file == null)
      {
        rawMatch = compiledRegexp.exec(data);
        continue;
      }

      var lineStart = Math.max(parseInt(match.line || 1) - 1, 0);
      var colStart = Math.max(parseInt(match.col || 1) - 1, 0);
      var lineEnd = lineStart;

      if (settings.gcc7orGreater && typeof match.placemarks !== "undefined") {
        var colEnd = Math.max(match.placemarks.lastIndexOf("~"), colStart+1);
      }
      else
      {
        var colEnd = colStart + 1;
      }

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
