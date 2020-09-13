const DirectIssueNote = require("../../../../data-access/models/DirectIssueNote")
const ListDirectIssueNoteModel = require("./ListDirectIssueNoteModel")

module.exports = {
  async execute(req, res) {
    try {
      let request = new ListDirectIssueNoteModel(req)

      let directIssueNotesQueryBuilder = DirectIssueNote.query()
        .where("date", ">=", request.startDate)
        .andWhere("date", "<=", request.endDate)

      if (request.active != null) {
        directIssueNotesQueryBuilder.andWhere("active", "=", request.active)
      }

      let directIssueNotes = await directIssueNotesQueryBuilder.execute()
      return res.json(directIssueNotes)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  }
}
