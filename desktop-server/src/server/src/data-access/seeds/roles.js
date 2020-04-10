const { roles } = require("../seed-factories/users-roles")

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("roles")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("roles").insert(roles)
    })
}
