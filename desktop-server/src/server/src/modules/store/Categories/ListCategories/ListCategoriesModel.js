const _ = require("lodash")

class ListCategoriesModel {
  constructor(req) {
    this.active = null

    if (_.has(req, ["query", "active"])) {
      this.active = req.query.active
    }
  }
}

module.exports = ListCategoriesModel
