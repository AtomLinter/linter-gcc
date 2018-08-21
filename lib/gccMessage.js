class GccMessage {
  constructor(colStart) {
    this.colStart = colStart;
  }
  colEnd() {
    return this.colStart + 1;
  }
}

function extractVariableName(message) {
  var match1 =  message.match(/\u2018.*\u2019/)[0];
  return match1.replace(/\u2018|\u2019/g, '');
}

class UndeclaredError extends GccMessage {
  constructor(colStart, message){
    super(colStart);
    this.varName = extractVariableName(message);
  }
  colEnd() {
    return this.colStart + this.varName.length;
  }
}

class UnusedVariableWarning extends GccMessage {
  constructor(colStart, message){
    super(colStart);
    this.varName = extractVariableName(message);
  }
  colEnd() {
    return this.colStart + this.varName.length;
  }
}

module.exports = {
  build: function(colStart, message) {
    if (message.includes("was not declared in this scope")) {
      return new UndeclaredError(colStart, message);
    }
    else if (message.includes("unused variable")) {
      return new UnusedVariableWarning(colStart, message);
    }
    else {
      return new GccMessage(colStart);
    }
  }
}
