const { NotFoundError } = require("objection")
const { DateTime } = require("luxon")
const Category = require("../../../../data-access/models/Category")
const DeleteCategoryModel = require("./DeleteCategoryModel")

module.exports = {
  async execute(req, res) {
    try {
      let request = new DeleteCategoryModel(req)

      let category = await Category.query()
        .findById(request.categoryId)
        .throwIfNotFound()
        .withGraphFetched("store_items")

      if (category.store_items != null && category.store_items.length > 0) {
        return res.status(400).json({
          messages: [
            "there are store items in this category, reassign those items to another category and then try deleting this category again"
          ]
        })
      }

      await Category.query()
        .findById(request.categoryId)
        .patch({ active: false, deleted_at: DateTime.local().toSeconds() })

      return res.json({ messages: ["successfully deleted selected category"] })
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not find the selected category"] })
      }

      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  }
}
