const { reservations } = require("../seed-factories/rooms-bookings-reservations-types")

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("reservations")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("reservations").insert(reservations)
    })
}
