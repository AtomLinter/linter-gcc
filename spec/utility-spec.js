"use babel";

describe('Utility functions', () => {
  const lint = require('../lib/main.js')
  var settings = require("../lib/config").settings

  beforeEach(() => {
    waitsForPromise(() => {
      atom.config.set('linter-gcc.execPath', '/usr/bin/g++')
      atom.config.set('linter-gcc.gccDefaultCFlags', '-Wall')
      atom.config.set('linter-gcc.gccDefaultCppFlags', '-Wall -std=c++11')
      atom.config.set('linter-gcc.gccErrorLimit', 15)
      atom.config.set('linter-gcc.gccIncludePaths', ' ')
      atom.config.set('linter-gcc.gccSuppressWarnings', true)
      atom.config.set('linter-gcc.gccLintOnTheFly', false)
      atom.packages.activatePackage("language-c")
      atom.packages.activatePackage("language-javascript")
      return atom.packages.activatePackage('linter-gcc')
    })
  })

  it('returns an editor for a C++ file', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/missing_include.cpp').then(editor => {
        expect(lint.getValidEditor(editor)).toBeDefined();
      })
    })
  })

  it('returns an editor for a C file', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/missing_include.c').then(editor => {
        expect(lint.getValidEditor(editor)).toBeDefined();
      })
    })
  })

  it('returns undefined for a javascript file', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + 'utility.js').then(editor => {
        expect(lint.getValidEditor(editor)).not.toBeDefined();
      })
    })
  })
})
