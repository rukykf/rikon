const DirectIssueNote = require("../../../../data-access/models/DirectIssueNote")
const CreateDirectIssueNoteModel = require("./CreateDirectIssueNoteModel")
const ValidationException = require("../../../Exceptions/ValidationException")

module.exports = {
  async execute(req, res) {
    try {
      let request = new CreateDirectIssueNoteModel(req)

      let directIssueNote = await DirectIssueNote.query().insert(request)

      return res.json(directIssueNote)
    } catch (error) {
      if (error instanceof ValidationException) {
        return res.status(400).json({ messages: error.messages })
      }

      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  }
}
