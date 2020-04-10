const bookshelf = require("../db-config")
const Room = require("./Room")

const Reservation = bookshelf.model("Reservation", {
  tableName: "reservations",
  room: function() {
    return this.belongsTo(Room)
  }
})

module.exports = Reservation
