const { NotFoundError, UniqueViolationError } = require("objection")
const Category = require("../../../../data-access/models/Category")
const UpdateCategoryModel = require("./UpdateCategoryModel")

module.exports = {
  async execute(req, res) {
    try {
      let request = new UpdateCategoryModel(req)

      let category = await Category.query()
        .patchAndFetchById(request.id, request)
        .throwIfNotFound()

      return res.json(category)
    } catch (error) {
      if (error instanceof UniqueViolationError) {
        return res.status(400).json({ messages: ["a category with this name already exists, select a different name"] })
      }

      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not find the selected category"] })
      }

      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  }
}
