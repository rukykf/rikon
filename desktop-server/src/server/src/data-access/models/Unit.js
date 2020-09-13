const Objection = require("../objection-config")

class Unit extends Objection {
  static get tableName() {
    return "units"
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["store_item_id", "name"],
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        store_item_id: { type: "integer" },
        conversion_to_receipt_unit: { type: "number" },
        is_receipt_unit: { type: "boolean" },
        is_issue_unit: { type: "boolean" },
        active: { type: "boolean" },
        deleted_at: { type: "integer" }
      }
    }
  }

  static get relationMappings() {
    const StoreItem = require("./StoreItem")

    return {
      store_item: {
        relation: Objection.BelongsToOneRelation,
        modelClass: StoreItem,
        join: {
          from: "units.store_item_id",
          to: "store_items.id"
        }
      }
    }
  }
}

module.exports = Unit
