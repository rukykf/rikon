const { orderItems } = require("../seed-factories/departments-sales-items-orders")

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("order_items")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("order_items").insert(orderItems)
    })
}
