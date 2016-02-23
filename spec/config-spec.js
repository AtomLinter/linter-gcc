"use babel";

describe('Configuration function tests', () => {
  const main = require('../lib/main')
  const utility = require('../lib/utility.js')
  var settings = require("../lib/config").settings

  beforeEach(() => {
    waitsForPromise(() => {
      atom.config.set('linter-gcc.execCCPath', '/usr/bin/g++')
      atom.config.set('linter-gcc.execFCPath', '/usr/bin/gfortran')
      atom.config.set('linter-gcc.gccDefaultCFlags', '-Wall')
      atom.config.set('linter-gcc.gccDefaultCppFlags', '-Wall -std=c++11')
      atom.config.set('linter-gcc.gccDefaultFortranFlags', '-Wall -cpp')
      atom.config.set('linter-gcc.gccErrorLimit', 15)
      atom.config.set('linter-gcc.gccIncludePaths', ' ')
      atom.config.set('linter-gcc.gccSuppressWarnings', true)
      main.messages={};
      return atom.packages.activatePackage('linter-gcc')
    })
  })

  it('Uses default settings when no config file is found', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/comment.cpp').then(() => {
          var config = settings()
          expect(config.execCCPath).toEqual("/usr/bin/g++")
          expect(config.execFCPath).toEqual("/usr/bin/gfortran")
          expect(config.gccDefaultCFlags).toEqual("-Wall")
          expect(config.gccDefaultCppFlags).toEqual("-Wall -std=c++11")
          expect(config.gccDefaultFortranFlags).toEqual("-Wall -cpp")
          expect(config.gccErrorLimit).toEqual(15)
          expect(config.gccIncludePaths).toEqual(" ")
          expect(config.gccSuppressWarnings).toEqual(true)
      })
    })
  })

  it('Uses file-specific config file when it exists', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/project_test/sub1/subsub1/file.cpp').then(() => {
          var config = settings()
          expect(config.execCCPath).toEqual("exec_cc_file")
          expect(config.execFCPath).toEqual("exec_fc_file")
          expect(config.gccDefaultCFlags).toEqual("cflags_file")
          expect(config.gccDefaultCppFlags).toEqual("cppflags_file")
          expect(config.gccDefaultFortranFlags).toEqual("fortranflags_file")
          expect(config.gccErrorLimit).toEqual(1)
          expect(config.gccIncludePaths).toEqual("includepath_file")
          expect(config.gccSuppressWarnings).toEqual(true)
      })
    })
  })

  it('Uses directory-specific config file when it exists', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/project_test/sub2/file.cpp').then(() => {
          var config = settings()
          expect(config.execCCPath).toEqual("exec_cc_subdir")
          expect(config.execFCPath).toEqual("exec_fc_subdir")
          expect(config.gccDefaultCFlags).toEqual("cflags_subdir")
          expect(config.gccDefaultCppFlags).toEqual("cppflags_subdir")
          expect(config.gccDefaultFortranFlags).toEqual("fortranflags_subdir")
          expect(config.gccErrorLimit).toEqual(2)
          expect(config.gccIncludePaths).toEqual("includepath_subdir")
          expect(config.gccSuppressWarnings).toEqual(true)
      })
    })
  })

  it('Uses current directory config file when it exists', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/project_test/sub2/file.cpp').then(() => {
          var config = settings()
          expect(config.execCCPath).toEqual("exec_cc_subdir")
          expect(config.execFCPath).toEqual("exec_fc_subdir")
          expect(config.gccDefaultCFlags).toEqual("cflags_subdir")
          expect(config.gccDefaultCppFlags).toEqual("cppflags_subdir")
          expect(config.gccDefaultFortranFlags).toEqual("fortranflags_subdir")
          expect(config.gccErrorLimit).toEqual(2)
          expect(config.gccIncludePaths).toEqual("includepath_subdir")
          expect(config.gccSuppressWarnings).toEqual(true)
      })
    })
  })

  it('Uses upper-level config file when it exists', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/project_test/sub4/subsub2/file.cpp').then(() => {
          var config = settings()
          expect(config.execCCPath).toEqual("exec_cc_updir")
          expect(config.execFCPath).toEqual("exec_fc_updir")
          expect(config.gccDefaultCFlags).toEqual("cflags_updir")
          expect(config.gccDefaultCppFlags).toEqual("cppflags_updir")
          expect(config.gccDefaultFortranFlags).toEqual("fortranflags_updir")
          expect(config.gccErrorLimit).toEqual(5)
          expect(config.gccIncludePaths).toEqual("includepath_updir")
          expect(config.gccSuppressWarnings).toEqual(true)
      })
    })
  })

  it('Uses project-specific config file when it exists', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/project_test').then( () => {
      return atom.workspace.open(__dirname + '/files/project_test/sub3/file.cpp').then( () => {
          var config = settings()
          expect(config.execCCPath).toEqual("exec_cc_project")
          expect(config.execFCPath).toEqual("exec_fc_project")
          expect(config.gccDefaultCFlags).toEqual("cflags_project")
          expect(config.gccDefaultCppFlags).toEqual("cppflags_project")
          expect(config.gccDefaultFortranFlags).toEqual("fortranflags_project")
          expect(config.gccErrorLimit).toEqual(3)
          expect(config.gccIncludePaths).toEqual("includepath_project")
          expect(config.gccSuppressWarnings).toEqual(false)
        })
      })
    })
  })
})
