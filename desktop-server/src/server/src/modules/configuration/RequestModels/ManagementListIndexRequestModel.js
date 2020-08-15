const _ = require("lodash")

module.exports = class ManagementListIndexRequestModel {
  constructor(req) {
    this.list_name = null
    this.active = 1

    if (_.has(req, ["query", "list_name"])) {
      this.list_name = req.query.list_name
    }

    if (_.has(req, ["query", "active"])) {
      this.active = _.toNumber(req.query.active)
    }
  }
}
