const bookshelf = require("../db-config")
const Room = require("./Room")
const Sale = require("./Sale")

const Booking = bookshelf.model("Booking", {
  tableName: "bookings",
  room: function() {
    return this.belongsTo(Room)
  },
  sale: function() {
    return this.morphOne(Sale, "sellable")
  }
})

module.exports = Booking
