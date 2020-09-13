const Objection = require("../objection-config")

class Category extends Objection {
  static get tableName() {
    return "categories"
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["name"],
      properties: {
        id: { type: "integer" },
        name: { type: "string", transform: ["trim"] }
      }
    }
  }

  static get relationMappings() {
    const StoreItem = require("./StoreItem")

    return {
      store_items: {
        relation: Objection.HasManyRelation,
        modelClass: StoreItem,
        join: {
          from: "categories.id",
          to: "store_items.category_id"
        }
      }
    }
  }
}

module.exports = Category
