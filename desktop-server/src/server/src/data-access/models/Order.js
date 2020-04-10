const bookshelf = require("../db-config")
const OrderItem = require("./OrderItem")

const Order = bookshelf.model("Order", {
  tableName: "orders",
  orderItems: function() {
    return this.hasMany(OrderItem)
  },
  sale: function() {
    return this.morphOne(Sale, "sellable")
  }
})

module.exports = Order
