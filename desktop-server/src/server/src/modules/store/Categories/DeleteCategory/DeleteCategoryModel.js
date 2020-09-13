const _ = require("lodash")

class DeleteCategoryModel {
  constructor(req) {
    this.categoryId = _.toNumber(req.params.id)
  }
}

module.exports = DeleteCategoryModel
