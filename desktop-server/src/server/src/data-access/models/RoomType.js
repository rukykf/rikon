const { ValidationError } = require("objection")
const _ = require("lodash")
const Objection = require("../objection-config")

class RoomType extends Objection {
  static get tableName() {
    return "room_types"
  }

  static get relationMappings() {
    const Room = require("./Room")

    return {
      rooms: {
        relation: Objection.HasManyRelation,
        modelClass: Room,
        join: {
          from: "room_types.id",
          to: "rooms.room_type_id"
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

  $parseDatabaseJson(json) {
    super.$parseDatabaseJson(json)
    json = _.omit(json, ["active"])
    return json
  }
}

module.exports = RoomType
