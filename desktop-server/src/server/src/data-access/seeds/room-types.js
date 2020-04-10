const { roomTypes } = require("../seed-factories/rooms-bookings-reservations-types")

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("room_types")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("room_types").insert(roomTypes)
    })
}
