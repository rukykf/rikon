const Objection = require("../db-config")

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
}
module.exports = RoomType
