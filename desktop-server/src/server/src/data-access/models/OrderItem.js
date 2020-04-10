const bookshelf = require("../db-config")

const OrderItem = bookshelf.model("OrderItem", {
  tableName: "order_items"
})

module.exports = OrderItem
