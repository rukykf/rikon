const _ = require("lodash")
const SalesItem = require("../../data-access/models/SalesItem")

module.exports = {
  async index(req, res) {
    try {
      let salesItemsQueryBuilder = SalesItem.query()
        .select(
          "*",
          SalesItem.relatedQuery("order_items")
            .count()
            .as("popularity")
        )
        .orderBy("popularity", "desc")

      if (_.get(req, ["query", "department_id"]) != null) {
        salesItemsQueryBuilder.where("department_id", "=", req.query.department_id)
      }

      let salesItems = await salesItemsQueryBuilder.execute()
      return res.json(salesItems)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, could not retrieve list of sales items"] })
    }
  }
}
