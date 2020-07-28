const OrderItem = require("../../data-access/models/OrderItem")
const OrderItemsIndexRequestModel = require("./RequestModels/OrderItemsIndexRequestModel")

module.exports = {
  async index(req, res) {
    try {
      let requestModel = new OrderItemsIndexRequestModel(req)

      let orderItemsQueryBuilder = OrderItem.query()
        .withGraphJoined("salesItem")
        .withGraphJoined("order")
        .where("order.created_at", ">=", requestModel.start_date)
        .andWhere("order.created_at", "<=", requestModel.end_date)

      if (requestModel.department_id != null) {
        orderItemsQueryBuilder.andWhere("salesItem.department_id", "=", requestModel.department_id)
      }

      if (requestModel.status != null) {
        orderItemsQueryBuilder.andWhere("order.status", "=", requestModel.status)
      }

      let orderItems = await orderItemsQueryBuilder.execute()

      res.json(orderItems)
    } catch (error) {
      res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  }
}
