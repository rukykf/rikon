const Objection = require("../db-config")
const { ValidationError } = require("objection")

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

  static get jsonSchema() {
    return {
      type: "object",
      required: ["room_no", "room_type_id"],
      properties: {
        id: { type: "integer" },
        room_no: { type: "integer", minimum: 100 },
        room_type_id: { type: "integer" }
      }
    }
  }

  async validateUnique() {
    if (this.room_no) {
      let existingRoom = await Room.query()
        .where("room_no", "=", this.room_no)
        .first()
      if (existingRoom != null) {
        throw new ValidationError({
          message: "this number is already assigned to another room",
          type: "NewRoomNumberValidation"
        })
      }
    }
  }

  async $beforeInsert() {
    await this.validateUnique()
  }

  async $beforeUpdate() {
    await this.validateUnique()
  }
}
module.exports = Room
