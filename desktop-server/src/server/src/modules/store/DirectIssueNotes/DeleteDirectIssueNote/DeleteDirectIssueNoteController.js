const { NotFoundError } = require("objection")
const { DateTime, Interval } = require("luxon")
const DirectIssueNote = require("../../../../data-access/models/DirectIssueNote")
const DeleteDirectIssueNoteModel = require("./DeleteDirectIssueNoteModel")

module.exports = {
  async execute(req, res) {
    try {
      let request = new DeleteDirectIssueNoteModel(req)

      let directIssueNote = await DirectIssueNote.query()
        .findById(request.directIssueNoteId)
        .throwIfNotFound()

      let interval = Interval.fromDateTimes(
        DateTime.fromISO(directIssueNote.created_at),
        DateTime.local().plus({ days: 1 })
      )

      if (interval.length("days") > 180) {
        return res
          .status(400)
          .json({ messages: ["you cannot delete an issue note that was created more than 180 days ago"] })
      }

      await DirectIssueNote.query()
        .findById(request.directIssueNoteId)
        .patch({
          active: false
        })

      return res.json({ messages: ["successfully deleted the selected direct issue note"] })
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not find the selected direct issue note"] })
      }

      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  }
}
