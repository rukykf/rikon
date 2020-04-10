const bookshelf = require("../db-config")
const Room = require("./Room")

const RoomType = bookshelf.model("RoomType", {
  tableName: "room_types",
  rooms: function() {
    return this.hasMany(Room, "room_type_id")
  }
})

module.exports = RoomType
