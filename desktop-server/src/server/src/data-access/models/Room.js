const { ValidationError } = require("objection")
const _ = require("lodash")
const Objection = require("../objection-config")

class Room extends Objection {
  static get tableName() {
    return "rooms"
  }

  static get relationMappings() {
    const RoomType = require("./RoomType")
    const Booking = require("./Booking")
    const Reservation = require("./Reservation")

    return {
      room_type: {
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
      currentBooking: {
        relation: Objection.HasOneRelation,
        modelClass: Booking,
        filter(builder) {
          builder.where("status", "open")
        },
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

  static get jsonSchema() {
    return {
      type: "object",
      required: ["room_no", "room_type_id"],
      properties: {
        id: { type: "integer" },
        room_no: { type: "integer", minimum: 1 },
        room_type_id: { type: "integer" }
      }
    }
  }

  $parseDatabaseJson(json) {
    super.$parseDatabaseJson(json)
    json = _.omit(json, ["active"])
    return json
  }
}

module.exports = Room
