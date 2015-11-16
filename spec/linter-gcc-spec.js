"use babel";

describe('The GCC provider for AtomLinter', () => {
  const lint = require('../lib/main').provideLinter().lint

  beforeEach(() => {
    waitsForPromise(() => {
      return atom.packages.activatePackage("linter-gcc").then( () => {
          atom.config.set('linter-gcc.gccDefaultCppFlags', "-Wall")
          atom.config.set('linter-gcc.execPath', "/usr/bin/g++")
      })
    })
  })

  it('finds an error in "missing_include.cpp"', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/missing_include.cpp').then(editor => {
        return lint(editor).then(messages => {
          expect(messages.length).toEqual(1)
          expect(messages[0].type).toEqual("error")
          expect(messages[0].text).toEqual("iostreams: No such file or directory")
        })
      })
    })
  })

  it('finds an error in "error.cpp"', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/error.cpp').then(editor => {
        return lint(editor).then(messages => {
          console.log(messages)
          expect(messages.length).toEqual(1)
          expect(messages[0].type).toEqual("error")
          expect(messages[0].text).toEqual("‘i’ was not declared in this scope")
        })
      })
    })
  })

  it('finds no errors in "comment.cpp"', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/comment.cpp').then(editor => {
        return lint(editor).then(messages => {
          console.log(messages)
          expect(messages.length).toEqual(0)
        })
      })
    })
  })
})
