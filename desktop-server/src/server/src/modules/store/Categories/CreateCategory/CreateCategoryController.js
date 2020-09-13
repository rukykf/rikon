const { UniqueViolationError } = require("objection")
const CreateCategoryModel = require("./CreateCategoryModel")
const ValidationException = require("../../../Exceptions/ValidationException")
const Logger = require("../../../../utils/Logger")
const Category = require("../../../../data-access/models/Category")

module.exports = {
  async execute(req, res) {
    try {
      let createCategoryModel = new CreateCategoryModel(req)
      let category = await Category.query().insert({
        name: createCategoryModel.name
      })
      return res.json(category)
    } catch (error) {
      Logger.logRequestError(req, error, "Error creating category... see below for error details")
      if (error instanceof ValidationException) {
        return res.status(400).json({ messages: error.messages })
      }

      if (error instanceof UniqueViolationError) {
        return res.status(400).json({ messages: ["a category with this name already exists, select a different name"] })
      }
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  }
}
