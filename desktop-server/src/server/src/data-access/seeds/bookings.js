const { openBookings, closedBookings } = require("../seed-factories/rooms-bookings-reservations-types")

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("bookings")
    .del()
    .then(function() {
      // Inserts seed entries
      let bookings = openBookings.concat(closedBookings)
      return knex("bookings").insert(bookings)
    })
}
