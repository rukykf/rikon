const { NotFoundError, ValidationError } = require("objection")
const ValidationException = require("../../../Exceptions/ValidationException")
const DirectIssueNote = require("../../../../data-access/models/DirectIssueNote")
const UpdateDirectIssueNoteModel = require("./UpdateDirectIssueNoteModel")

module.exports = {
  async execute(req, res) {
    try {
      let request = new UpdateDirectIssueNoteModel(req)

      let oldDirectIssueNote = await DirectIssueNote.query()
        .findById(request.directIssueNoteId)
        .throwIfNotFound()

      if (request.newDirectIssueNoteDetails.remarks == null) {
        request.newDirectIssueNoteDetails.remarks = oldDirectIssueNote.remarks
      }

      if (request.newDirectIssueNoteDetails.serial_no == null) {
        request.newDirectIssueNoteDetails.serial_no = oldDirectIssueNote.serial_no
      }

      if (request.newDirectIssueNoteDetails.date == null) {
        request.newDirectIssueNoteDetails.date = oldDirectIssueNote.date
      }

      let oldDirectIssueNoteIds = oldDirectIssueNote.old_direct_issue_notes_ids

      if (oldDirectIssueNoteIds == null) {
        oldDirectIssueNoteIds = []
      }

      oldDirectIssueNoteIds.push(oldDirectIssueNote.id)

      let newDirectIssueNote = await DirectIssueNote.query().insert(request.newDirectIssueNoteDetails)

      await DirectIssueNote.query()
        .findById(oldDirectIssueNote.id)
        .patch({ active: false })

      newDirectIssueNote = await DirectIssueNote.query().patchAndFetchById(newDirectIssueNote.id, {
        old_direct_issue_notes_ids: oldDirectIssueNoteIds
      })

      return res.json(newDirectIssueNote)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["the selected direct issue note was not found"] })
      }

      if (error instanceof ValidationError) {
        return res.status(400).json({ messages: ["ensure the data provided is in the correct format"] })
      }

      if (error instanceof ValidationException) {
        return res.status(400).json({ messages: error.messages })
      }

      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  }
}
