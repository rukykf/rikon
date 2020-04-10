const bookshelf = require("../db-config")
const RoomType = require("./RoomType")
const Booking = require("./Booking")
const Reservation = require("./Reservation")

const Room = bookshelf.model("Room", {
  tableName: "rooms",
  roomType: function() {
    return this.belongsTo(RoomType, "room_type_id")
  },
  bookings: function() {
    return this.hasMany(Booking)
  },
  reservations: function() {
    return this.hasMany(Reservation)
  }
})

module.exports = Room
