const _ = require("lodash")

class UpdateCategoryModel {
  constructor(req) {
    this.id = _.toNumber(req.params.id)

    if (_.has(req, ["body", "name"])) {
      this.name = req.body.name
    }
  }
}

module.exports = UpdateCategoryModel
