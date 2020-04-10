const { sales } = require("../seed-factories/sales-transactions")

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("sales")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("sales").insert(sales)
    })
}
