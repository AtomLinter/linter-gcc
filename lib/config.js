'use strict';

var path = require('path');
var fs = require('fs');

module.exports.niceName = 'Custom file (.gcc-flags.json)';

module.exports.settings = function () {

  var SETTINGS_FILENAME = ".gcc-flags.json";
  var MAX_ITERATIONS = 30;

  var file_settings = atom.workspace.getActiveTextEditor().getPath() + SETTINGS_FILENAME;
  var directory_settings = path.join(path.dirname(file_settings), SETTINGS_FILENAME);
  var config_file = "";

  if (fs.existsSync(file_settings)) {
      config_file = file_settings;
  } else if (fs.existsSync(directory_settings)) {
      config_file = directory_settings;
  }

  if (config_file == "" && atom.project.getPaths()[0] != undefined) {
      var project_path = atom.project.getPaths()[0];
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

  if (atom.config.get("linter-gcc.gccDebug")){
    if (config_file.length > 0) {
      console.log("linter-gcc: Reading settings from: " + config_file);
    } else {
      console.log("linter-gcc: Using configuration page settings");
    }
  }

  if (config_file != "") {
      delete require.cache[config_file];
      var config_data = require(config_file);
      return {
        execPath: config_data.execPath,
        gccIncludePaths: config_data.gccIncludePaths,
        gccSuppressWarnings: config_data.gccSuppressWarnings,
        gccDefaultCFlags: config_data.gccDefaultCFlags,
        gccDefaultCppFlags: config_data.gccDefaultCppFlags,
        gccErrorLimit: config_data.gccErrorLimit,
        gccErrorString: config_data.gccErrorString,
        gccWarningString: config_data.gccWarningString,
        gccNoteString: config_data.gccNoteString
      };
  } else {
      return {
          execPath: atom.config.get("linter-gcc.execPath"),
          gccIncludePaths: atom.config.get("linter-gcc.gccIncludePaths"),
          gccSuppressWarnings: atom.config.get("linter-gcc.gccSuppressWarnings"),
          gccDefaultCFlags: atom.config.get("linter-gcc.gccDefaultCFlags"),
          gccDefaultCppFlags: atom.config.get("linter-gcc.gccDefaultCppFlags"),
          gccErrorLimit: atom.config.get("linter-gcc.gccErrorLimit"),
          gccErrorString: atom.config.get("linter-gcc.gccErrorString"),
          gccWarningString: atom.config.get("linter-gcc.gccWarningString"),
          gccNoteString: atom.config.get("linter-gcc.gccNoteString")
      };
  }

};
