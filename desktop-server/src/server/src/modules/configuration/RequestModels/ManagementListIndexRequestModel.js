const _ = require("lodash")

module.exports = class ManagementListIndexRequestModel {
  constructor(req) {
    this.list_name = null

    if (_.has(req, ["query", "list_name"])) {
      this.list_name = req.query.list_name
    }
  }
}
