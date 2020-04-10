const { departments } = require("../seed-factories/departments-sales-items-orders")

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("departments")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("departments").insert(departments)
    })
}
