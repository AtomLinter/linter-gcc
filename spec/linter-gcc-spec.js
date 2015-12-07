"use babel";

describe('The GCC provider for AtomLinter', () => {
  const lint = require('../lib/main').provideLinter().lint
  var settings = require("../lib/config").settings

  beforeEach(() => {
    waitsForPromise(() => {
      atom.config.set('linter-gcc.execPath', '/usr/bin/g++')
      atom.config.set('linter-gcc.gccDefaultCFlags', '-Wall')
      atom.config.set('linter-gcc.gccDefaultCppFlags', '-Wall -std=c++11')
      atom.config.set('linter-gcc.gccErrorLimit', 15)
      atom.config.set('linter-gcc.gccIncludePaths', ' ')
      atom.config.set('linter-gcc.gccSuppressWarnings', true)
      return atom.packages.activatePackage('linter-gcc')
    })
  })

  it('finds an error in "missing_include.cpp"', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/missing_include.cpp').then(editor => {
        return lint(editor).then(messages => {
          expect(messages.length).toEqual(1)
          expect(messages[0].type).toEqual("error")
        })
      })
    })
  })

  it('finds an error in "error.cpp"', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/error.cpp').then(editor => {
        return lint(editor).then(messages => {
          expect(messages.length).toEqual(1)
          expect(messages[0].type).toEqual("error")
        })
      })
    })
  })

  it('finds no errors in "comment.cpp"', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/comment.cpp').then(editor => {
        return lint(editor).then(messages => {
          expect(messages.length).toEqual(0)
        })
      })
    })
  })

  it('finds an error in "missing_include.c"', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/missing_include.c').then(editor => {
        return lint(editor).then(messages => {
          expect(messages.length).toEqual(1)
          expect(messages[0].type).toEqual("error")
        })
      })
    })
  })

  it('finds an error in "error.c"', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/error.c').then(editor => {
        return lint(editor).then(messages => {
          expect(messages.length).toEqual(1)
          expect(messages[0].type).toEqual("error")
        })
      })
    })
  })

  it('finds no errors in "comment.c"', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/comment.c').then(editor => {
        return lint(editor).then(messages => {
          expect(messages.length).toEqual(0)
        })
      })
    })
  })

  it('Uses default settings when no config file is found', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/comment.cpp').then(() => {
          var config = settings()
          expect(config.execPath).toEqual("/usr/bin/g++")
          expect(config.gccDefaultCFlags).toEqual("-Wall")
          expect(config.gccDefaultCppFlags).toEqual("-Wall -std=c++11")
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
          expect(config.execPath).toEqual("exec_file")
          expect(config.gccDefaultCFlags).toEqual("cflags_file")
          expect(config.gccDefaultCppFlags).toEqual("cppflags_file")
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
          expect(config.execPath).toEqual("exec_subdir")
          expect(config.gccDefaultCFlags).toEqual("cflags_subdir")
          expect(config.gccDefaultCppFlags).toEqual("cppflags_subdir")
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
          expect(config.execPath).toEqual("exec_subdir")
          expect(config.gccDefaultCFlags).toEqual("cflags_subdir")
          expect(config.gccDefaultCppFlags).toEqual("cppflags_subdir")
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
          expect(config.execPath).toEqual("exec_updir")
          expect(config.gccDefaultCFlags).toEqual("cflags_updir")
          expect(config.gccDefaultCppFlags).toEqual("cppflags_updir")
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
          expect(config.execPath).toEqual("exec_project")
          expect(config.gccDefaultCFlags).toEqual("cflags_project")
          expect(config.gccDefaultCppFlags).toEqual("cppflags_project")
          expect(config.gccErrorLimit).toEqual(3)
          expect(config.gccIncludePaths).toEqual("includepath_project")
          expect(config.gccSuppressWarnings).toEqual(false)
        })
      })
    })
  })

})
