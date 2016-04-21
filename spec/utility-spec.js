"use babel";

describe('Utility functions', () => {
  const utility = require('../lib/utility.js')

  beforeEach(() => {
    waitsForPromise(() => {
      atom.config.set('linter-gcc.execPath', '/usr/bin/g++')
      atom.config.set('linter-gcc.gccDefaultCFlags', '-Wall')
      atom.config.set('linter-gcc.gccDefaultCppFlags', '-Wall -std=c++11')
      atom.config.set('linter-gcc.gccErrorLimit', 15)
      atom.config.set('linter-gcc.gccIncludePaths', ' ')
      atom.config.set('linter-gcc.gccSuppressWarnings', true)
      atom.config.set('linter-gcc.gccLintOnTheFly', false)
      atom.config.set('linter-gcc.gccDebug', false)
      atom.config.set('linter-gcc.gccErrorString', 'error')
      atom.config.set('linter-gcc.gccWarningString', 'warning')
      atom.config.set('linter-gcc.gccNoteString', 'note')
      atom.packages.activatePackage("language-c")
      atom.packages.activatePackage("language-javascript")
      return atom.packages.activatePackage('linter-gcc')
    })
  })

  it('returns an editor for a C++ file', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/missing_include.cpp').then(editor => {
        expect(utility.getValidEditor(editor)).toBeDefined();
      })
    })
  })

  it('returns an editor for a C file', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/missing_include.c').then(editor => {
        expect(utility.getValidEditor(editor)).toBeDefined();
      })
    })
  })

  it('returns undefined for a javascript file', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/../lib/utility.js').then(editor => {
        expect(utility.getValidEditor(editor)).not.toBeDefined();
      })
    })
  })

  it('returns no subdirectories for an empty directory', () => {
    list = []
    expect(utility.walkSync(__dirname + "/files/project_test/sub1/subsub1/")).toEqual([]);
  })

  it('returns one subdirectory correctly', () => {
    list = []
    expect(utility.walkSync(__dirname + "/files/project_test/sub1")).toEqual([__dirname + "/files/project_test/sub1/subsub1"]);
  })

  it('returns multiple subdirectories correctly', () => {
    list = []
    expect(utility.walkSync(__dirname + "/files/project_test")).toEqual([
      __dirname + "/files/project_test/sub1",
      __dirname + "/files/project_test/sub1/subsub1",
      __dirname + "/files/project_test/sub2",
      __dirname + "/files/project_test/sub4",
      __dirname + "/files/project_test/sub4/subsub2"
    ]);
  })
})
