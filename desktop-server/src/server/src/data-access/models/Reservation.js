const Objection = require("../db-config")

class Reservation extends Objection {
  static get tableName() {
    return "reservations"
  }

  static get relationMappings() {
    const Room = require("./Room")
    return {
      room: {
        relation: Objection.BelongsToOneRelation,
        modelClass: Room,
        join: {
          from: "reservations.room_id",
          to: "rooms.id"
        }
      }
    }
  }
}

module.exports = Reservation
