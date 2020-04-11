const Objection = require("../db-config")

class Room extends Objection {
  static get tableName() {
    return "rooms"
  }

  static get relationMappings() {
    const RoomType = require("./RoomType")
    const Booking = require("./Booking")
    const Reservation = require("./Reservation")

    return {
      roomType: {
        relation: Objection.BelongsToOneRelation,
        modelClass: RoomType,
        join: {
          from: "rooms.room_type_id",
          to: "room_types.id"
        }
      },
      bookings: {
        relation: Objection.HasManyRelation,
        modelClass: Booking,
        join: {
          from: "rooms.id",
          to: "bookings.room_id"
        }
      },
      reservations: {
        relation: Objection.HasManyRelation,
        modelClass: Reservation,
        join: {
          from: "rooms.id",
          to: "reservations.room_id"
        }
      }
    }
  }
}
module.exports = Room
