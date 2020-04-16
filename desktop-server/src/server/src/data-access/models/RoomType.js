const Objection = require("../db-config")
const { ValidationError } = require("objection")

class RoomType extends Objection {
  static get tableName() {
    return "room_types"
  }

  static get relationMappings() {
    const Room = require("./Room")

    return {
      room: {
        relation: Objection.HasManyRelation,
        modelClass: Room,
        join: {
          from: "room_types.id",
          to: "room.room_type_id"
        }
      }
    }
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["price_per_night", "name"],
      properties: {
        price_per_night: { type: "number", minimum: 300 },
        name: { type: "string", minLength: 1, transform: ["trim", "toLowerCase"] }
      }
    }
  }

  async validateUnique() {
    if (this.name) {
      let existingRoomType = await RoomType.query()
        .where("name", "=", this.name.toLowerCase())
        .first()

      if (existingRoomType != null) {
        throw new ValidationError({
          message: "this name is already assigned to another room type",
          type: "NewRoomTypeNameValidation"
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
module.exports = RoomType
