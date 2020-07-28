const { managementListItems, managementListTransactions } = require("../seed-factories/management-lists-transactions")

exports.seed = function(knex) {
  // Deletes ALL existing entries
  knex("management_lists")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("management_lists").insert(managementListItems)
    })

  return knex("management_lists_transactions")
    .del()
    .then(function() {
      return knex("management_lists_transactions").insert(managementListTransactions)
    })
}
