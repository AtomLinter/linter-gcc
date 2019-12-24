'use strict';

var path = require('path');
var fs = require('fs');
var config_file_cache = new Map();

module.exports.niceName = 'Custom file (.gcc-flags.json)';

module.exports.settings = function () {

  var SETTINGS_FILENAME = ".gcc-flags.json";
  var MAX_ITERATIONS = 30;

  var linted_file = atom.workspace.getActiveTextEditor().getPath();
  var file_settings = linted_file + SETTINGS_FILENAME;
  var directory_settings = path.join(path.dirname(file_settings), SETTINGS_FILENAME);
  var config_file = "";
  if (fs.existsSync(file_settings)) {
    config_file = file_settings;
  } else if (fs.existsSync(directory_settings)) {
    config_file = directory_settings;
  }

  let project_path = atom.project.relativizePath(linted_file)[0];
  if (project_path === null) {
    project_path = path.dirname(linted_file);
  }

  if (config_file == "") {
    var current_path = path.dirname(file_settings);
    var current_file = "";
    var counter = 0;
    while (path.relative(current_path, project_path) != "" && counter < MAX_ITERATIONS){
      current_path = path.join(current_path, "..");
      current_file = path.join(current_path, SETTINGS_FILENAME);
      if (fs.existsSync(current_file)) {
        config_file = current_file;
        break;
      }
      counter += 1;
    }
  }

  if (atom.config.get("linter-gcc2.gccDebug")){
    if (config_file.length > 0) {
      console.log("linter-gcc2: Reading settings from: " + config_file);
    } else {
      console.log("linter-gcc2: Using configuration page settings");
    }
  }
  var commands_file = ""
  if (config_file != "") {
    var last_modified = fs.statSync(config_file).mtime.getTime();
    var config_data = {};
    if (config_file_cache.has(config_file) && config_file_cache.get(config_file).last_modified == last_modified)
    {
      config_data = config_file_cache.get(config_file).config_data;
    }
    else
    {
      config_data = JSON.parse(fs.readFileSync(config_file));
      config_file_cache.set(config_file, {last_modified: last_modified, config_data: config_data});
    }
    if ("compileCommandsFile" in config_data) {
      commands_file = config_data.compileCommandsFile;
    } else {
      commands_file = atom.config.get("linter-gcc2.compileCommandsFile");
    }
    return {
      execPath: config_data.execPath,
      gccIncludePaths: config_data.gccIncludePaths,
      gccISystemPaths: config_data.gccISystemPaths,
      gccSuppressWarnings: config_data.gccSuppressWarnings,
      gcc7orGreater: config_data.gcc7orGreater,
      gccDefaultCFlags: config_data.gccDefaultCFlags,
      gccDefaultCppFlags: config_data.gccDefaultCppFlags,
      gccErrorLimit: config_data.gccErrorLimit,
      gccErrorString: config_data.gccErrorString,
      gccWarningString: config_data.gccWarningString,
      gccNoteString: config_data.gccNoteString,
      compileCommandsFile: commands_file
    };
  } else {
    return {
      execPath: atom.config.get("linter-gcc2.execPath"),
      gccIncludePaths: atom.config.get("linter-gcc2.gccIncludePaths"),
      gccISystemPaths: atom.config.get("linter-gcc2.gccISystemPaths"),
      gccSuppressWarnings: atom.config.get("linter-gcc2.gccSuppressWarnings"),
      gcc7orGreater: atom.config.get("linter-gcc2.gcc7orGreater"),
      gccDefaultCFlags: atom.config.get("linter-gcc2.gccDefaultCFlags"),
      gccDefaultCppFlags: atom.config.get("linter-gcc2.gccDefaultCppFlags"),
      gccErrorLimit: atom.config.get("linter-gcc2.gccErrorLimit"),
      gccErrorString: atom.config.get("linter-gcc2.gccErrorString"),
      gccWarningString: atom.config.get("linter-gcc2.gccWarningString"),
      gccNoteString: atom.config.get("linter-gcc2.gccNoteString"),
      compileCommandsFile: atom.config.get("linter-gcc2.compileCommandsFile"),
    };
  }

};
