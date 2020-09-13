const { NotFoundError } = require("objection")
const UpdateDirectIssueNoteDetailsModel = require("./UpdateDirectIssueNoteDetailsModel")
const DirectIssueNote = require("../../../../data-access/models/DirectIssueNote")

module.exports = {
  async execute(req, res) {
    try {
      let request = new UpdateDirectIssueNoteDetailsModel(req)

      let updatedDirectIssueNote = await DirectIssueNote.query()
        .patchAndFetchById(request.id, request)
        .throwIfNotFound()

      return res.json(updatedDirectIssueNote)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["the selected direct issue note was not found"] })
      }

      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  }
}
