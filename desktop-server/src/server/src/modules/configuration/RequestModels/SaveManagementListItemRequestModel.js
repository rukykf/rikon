const _ = require("lodash")

class SaveManagementListItemRequestModel {
  constructor(req) {
    if (_.has(req, ["body", "full_name"])) {
      this.full_name = req.body.full_name
    }

    if (_.has(req, ["body", "list_name"])) {
      this.list_name = req.body.list_name
    }
  }
}

module.exports = SaveManagementListItemRequestModel
