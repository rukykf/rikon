const { NotFoundError } = require("objection")
const DirectIssueNote = require("../../../../data-access/models/DirectIssueNote")
const ShowDirectIssueNoteModel = require("./ShowDirectIssueNoteModel")

module.exports = {
  async execute(req, res) {
    try {
      let request = new ShowDirectIssueNoteModel(req)

      let directIssueNotes = await DirectIssueNote.query()
        .findByIds(request.selectedDirectIssueNoteIds)
        .throwIfNotFound()

      return res.json(directIssueNotes)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["some of the selected direct issue notes could not be found"] })
      }

      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  }
}
