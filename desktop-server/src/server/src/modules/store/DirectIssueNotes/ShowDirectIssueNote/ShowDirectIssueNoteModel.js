const _ = require("lodash")

class ShowDirectIssueNoteModel {
  constructor(req) {
    this.selectedDirectIssueNoteIds = []

    if (_.has(req, ["body", "selectedIds"])) {
      this.selectedDirectIssueNoteIds = req.body.selectedIds
    }
  }
}

module.exports = ShowDirectIssueNoteModel
