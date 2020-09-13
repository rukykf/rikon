const _ = require("lodash")
const ValidationException = require("../../../Exceptions/ValidationException")

class CreateCategoryModel {
  constructor(req) {
    if (!_.has(req, ["body", "name"])) {
      throw new ValidationException(["the name of the category is required"])
    }

    this.name = req.body.name
  }
}

module.exports = CreateCategoryModel
