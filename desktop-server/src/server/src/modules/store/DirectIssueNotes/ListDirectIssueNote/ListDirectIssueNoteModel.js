const _ = require("lodash")
const { DateTime } = require("luxon")

class ListDirectIssueNoteModel {
  constructor(req) {
    this.startDate = DateTime.local()
      .minus({ days: 7 })
      .toISODate()
    this.endDate = DateTime.local()
      .plus({ days: 1 })
      .toISODate()
    this.active = null

    if (_.has(req, ["query", "start_date"])) {
      this.startDate = req.query.start_date
    }

    if (_.has(req, ["query", "end_date"])) {
      this.endDate = req.query.end_date
    }

    if (_.has(req, ["query", "active"])) {
      this.active = req.query.active
    }
  }
}

module.exports = ListDirectIssueNoteModel
