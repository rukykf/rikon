const { DateTime } = require("luxon")
const Objection = require("../objection-config")

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

  static get jsonSchema() {
    return {
      type: "object",
      required: ["room_id", "start_date", "end_date", "customer_details"],
      properties: {
        id: { type: "integer" },
        room_id: { type: "integer" },
        start_date: { type: "string", transform: ["trim"] },
        end_date: { type: "string", transform: ["trim"] },
        customer_details: { type: "object" },
        status: { type: "string", enum: ["open", "closed", "cancelled"] }
      }
    }
  }

  $beforeInsert(queryContext) {
    if (this.created_at == null) {
      this.created_at = DateTime.local().toISODate()
    }

    this.updated_at = DateTime.local().toISODate()
    super.$beforeInsert(queryContext)
  }

  $beforeUpdate(opt, queryContext) {
    this.updated_at = DateTime.local().toISODate()
    super.$beforeUpdate(opt, queryContext)
  }
}

module.exports = Reservation
