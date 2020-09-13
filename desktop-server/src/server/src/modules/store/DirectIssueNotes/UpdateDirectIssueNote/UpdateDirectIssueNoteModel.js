const _ = require("lodash")
const CreateDirectIssueNoteModel = require("../CreateDirectIssueNote/CreateDirectIssueNoteModel")

class UpdateDirectIssueNoteModel {
  constructor(req) {
    this.directIssueNoteId = _.toNumber(req.params.id)

    this.newDirectIssueNoteDetails = new CreateDirectIssueNoteModel(req)
  }
}

module.exports = UpdateDirectIssueNoteModel
