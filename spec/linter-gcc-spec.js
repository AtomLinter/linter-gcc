"use babel";

describe('The GCC provider for AtomLinter', () => {
  const main = require('../lib/main')
  const utility = require('../lib/utility.js')
  var settings = require("../lib/config").settings

  beforeEach(() => {
    waitsForPromise(() => {
      main.messages = {};
      main.last_linted_files = new Set([]);
      atom.config.set('linter-gcc2.execPath', '/usr/bin/g++')
      atom.config.set('linter-gcc2.gccDefaultCFlags', '-c -Wall -o /dev/null')
      atom.config.set('linter-gcc2.gccDefaultCppFlags', '-c -Wall -std=c++11 -o /dev/null')
      atom.config.set('linter-gcc2.gccErrorLimit', 15)
      atom.config.set('linter-gcc2.gccIncludePaths', ' ')
      atom.config.set('linter-gcc2.gccISystemPaths', ' ')
      atom.config.set('linter-gcc2.gccSuppressWarnings', true)
      atom.config.set('linter-gcc2.gccRelintMessageSources', false)
      atom.config.set('linter-gcc2.gcc7orGreater', false)
      atom.config.set('linter-gcc2.gccLintOnTheFly', false)
      atom.config.set('linter-gcc2.gccDebug', false)
      atom.config.set('linter-gcc2.gccErrorString', 'error')
      atom.config.set('linter-gcc2.gccWarningString', 'warning')
      atom.config.set('linter-gcc2.gccNoteString', 'note')
      atom.packages.activatePackage('language-c')
      return atom.packages.activatePackage('linter-gcc2')
    })
  })

  it('finds one error in error.cpp', () => {
    waitsForPromise(() => {
      filename = __dirname + '/files/error.cpp'
      return atom.workspace.open(filename).then(editor => {
        return main.lint(editor, editor.getPath(), editor.getPath()).then(function() {
          var length = utility.flattenHash(main.messages).length
          expect(length).toEqual(1);
        })
      })
    })
  })

  it('finds no errors in comment.cpp', () => {
    waitsForPromise(() => {
      filename = __dirname + '/files/comment.cpp'
      return atom.workspace.open(filename).then(editor => {
        return main.lint(editor, editor.getPath(), editor.getPath()).then(function() {
          var length = utility.flattenHash(main.messages).length
          expect(length).toEqual(0);
        })
      })
    })
  })

  it('finds one error in error.c', () => {
    waitsForPromise(() => {
      filename = __dirname + '/files/error.c'
      return atom.workspace.open(filename).then(editor => {
        return main.lint(editor, editor.getPath(), editor.getPath()).then(function() {
          var length = utility.flattenHash(main.messages).length
          expect(length).toEqual(1);
        })
      })
    })
  })

  it('finds no errors in comment.c', () => {
    waitsForPromise(() => {
      filename = __dirname + '/files/comment.c'
      return atom.workspace.open(filename).then(editor => {
        return main.lint(editor, editor.getPath(), editor.getPath()).then(function() {
          var length = utility.flattenHash(main.messages).length
          expect(length).toEqual(0);
        })
      })
    })
  })
})
