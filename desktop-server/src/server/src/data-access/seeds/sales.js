const { sales } = require("../seed-factories/sales-transactions")
const { transactionSales } = require("../seed-factories/management-lists-transactions")

exports.seed = function(knex) {
  sales.push(...transactionSales)

  // Deletes ALL existing entries
  return knex("sales")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("sales").insert(sales)
    })
}
