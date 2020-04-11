const Objection = require("../db-config")

class Booking extends Objection {
  static get tableName() {
    return "bookings"
  }

  static get relationMappings() {
    const Room = require("./Room")
    const Sale = require("./Sale")

    return {
      room: {
        relation: Objection.BelongsToOneRelation,
        modelClass: Room,
        join: {
          from: "bookings.room_id",
          to: "rooms.id"
        }
      },
      sale: {
        relation: Objection.HasOneRelation,
        modelClass: Sale,
        filter(builder) {
          builder.where("sellable_type", "booking")
        },
        beforeInsert(model) {
          model.sellable_type = "booking"
        },
        join: {
          from: "bookings.id",
          to: "sales.sellable_id"
        }
      }
    }
  }
}
module.exports = Booking
