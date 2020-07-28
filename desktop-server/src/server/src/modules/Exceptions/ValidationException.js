class ValidationException extends Error {
  constructor(messages = ["something went wrong"]) {
    super("the data provided is invalid")
    this.messages = []
    this.messages.push(...messages)
  }
}

module.exports = ValidationException
