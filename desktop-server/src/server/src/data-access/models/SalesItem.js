const bookshelf = require("../db-config")
const OrderItem = require("./OrderItem")
const Order = require("./Order")

const SalesItem = bookshelf.model("SalesItem", {
  tableName: "sales_items",
  orderItems: function() {
    return this.hasMany(OrderItem, "sales_item_id")
  }
})

module.exports = SalesItem
