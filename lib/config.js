'use strict';

var path = require('path');
var fs = require('fs');

module.exports.niceName = 'Custom file (.gcc-flags.json)';

module.exports.settings = function () {
  // atom.notifications.addInfo( "inside settings function", { detail: "inside settings function" } );

  var cwd = atom.project.getPaths()[0]
  if (!cwd) { return; }
  var gccConfig = path.join(cwd,'/.gcc-flags.json');

  if ( !(fs.existsSync(gccConfig) ) ) {
      return;
 }
  gccConfig = fs.realpathSync(path.join(cwd,'/.gcc-flags.json'));

  delete require.cache[gccConfig];

  var createConfig = function(config) {
    return {
      execPath: config.execPath,
      gccIncludePaths: config.gccIncludePaths,
      gccSuppressWarnings: config.gccSuppressWarnings,
      gccDefaultCFlags: config.gccDefaultCFlags,
      gccDefaultCppFlags: config.gccDefaultCppFlags,
      gccErrorLimit: config.gccErrorLimit
    };
  };

  var configData = require(gccConfig);
  var conf = createConfig(configData);

  // Debugging messages
  // atom.notifications.addInfo( "execPath", { detail: conf.execPath } );
  // atom.notifications.addInfo( "gccDefaultCFlags", { detail: conf.gccDefaultCFlags } );
  // atom.notifications.addInfo( "gccDefaultCppFlags", { detail: conf.gccDefaultCppFlags } );
  // atom.notifications.addInfo( "gccErrorLimit", { detail: conf.gccErrorLimit } );
  // atom.notifications.addInfo( "gccIncludePaths", { detail: conf.gccIncludePaths } );
  // atom.notifications.addInfo( "gccSuppressWarnings", { detail: conf.gccSuppressWarnings } );

  atom.config.set("linter-gcc.execPath", conf.execPath);
  atom.config.set("linter-gcc.gccDefaultCFlags", conf.gccDefaultCFlags);
  atom.config.set("linter-gcc.gccDefaultCppFlags", conf.gccDefaultCppFlags);
  atom.config.set("linter-gcc.gccErrorLimit", conf.gccErrorLimit);
  atom.config.set("linter-gcc.gccIncludePaths", conf.gccIncludePaths);
  atom.config.set("linter-gcc.gccSuppressWarnings", conf.gccSuppressWarnings);

};
