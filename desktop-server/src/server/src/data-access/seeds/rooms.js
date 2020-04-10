const { rooms } = require("../seed-factories/rooms-bookings-reservations-types")

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("rooms")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("rooms").insert(rooms)
    })
}
