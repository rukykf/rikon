const { salesItems } = require("../seed-factories/departments-sales-items-orders")

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("sales_items")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("sales_items").insert(salesItems)
    })
}
