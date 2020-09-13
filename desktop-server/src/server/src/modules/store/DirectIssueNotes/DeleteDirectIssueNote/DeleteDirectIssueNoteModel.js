const _ = require("lodash")

class DeleteDirectIssueNoteModel {
  constructor(req) {
    this.directIssueNoteId = _.toNumber(req.params.id)
  }
}

module.exports = DeleteDirectIssueNoteModel
