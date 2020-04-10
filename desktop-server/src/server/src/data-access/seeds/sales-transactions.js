const { salesTransactions } = require("../seed-factories/sales-transactions")

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("sales_transactions")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("sales_transactions").insert(salesTransactions)
    })
}
