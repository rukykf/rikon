const Category = require("../../../../data-access/models/Category")
const ListCategoriesModel = require("./ListCategoriesModel")

module.exports = {
  async execute(req, res) {
    try {
      let request = new ListCategoriesModel(req)

      let categoriesQueryBuilder = Category.query()

      if (request.active !== null) {
        categoriesQueryBuilder.where("active", "=", request.active)
      } else {
        categoriesQueryBuilder.where("active", "=", 1)
      }

      let categories = await categoriesQueryBuilder.execute()
      return res.json(categories)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  }
}
