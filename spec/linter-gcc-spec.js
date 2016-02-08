"use babel";

describe('The GCC provider for AtomLinter', () => {
  const main = require('../lib/main')
  const utility = require('../lib/utility.js')
  var settings = require("../lib/config").settings

  beforeEach(() => {
    waitsForPromise(() => {
      atom.config.set('linter-gcc.execPath', '/usr/bin/g++')
      atom.config.set('linter-gcc.gccDefaultCFlags', '-Wall')
      atom.config.set('linter-gcc.gccDefaultCppFlags', '-Wall -std=c++11')
      atom.config.set('linter-gcc.gccErrorLimit', 15)
      atom.config.set('linter-gcc.gccIncludePaths', ' ')
      atom.config.set('linter-gcc.gccSuppressWarnings', true)
      main.messages={};
      return atom.packages.activatePackage('linter-gcc')
    })
  })

  it('finds one error in error.cpp', () => {
    waitsForPromise(() => {
      filename = __dirname + '/files/error.cpp'
      return atom.workspace.open(filename).then(editor => {
        main.lint(editor, editor.getPath(), editor.getPath()).then(function(){
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
        main.lint(editor, editor.getPath(), editor.getPath()).then(function(){
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
        main.lint(editor, editor.getPath(), editor.getPath()).then(function(){
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
        main.lint(editor, editor.getPath(), editor.getPath()).then(function(){
          var length = utility.flattenHash(main.messages).length
          expect(length).toEqual(0);
        })
      })
    })
  })
})
