const Objection = require("../objection-config")

class Order extends Objection {
  static get tableName() {
    return "orders"
  }

  static get relationMappings() {
    const OrderItem = require("./OrderItem")
    const Sale = require("./Sale")

    return {
      order_items: {
        relation: Objection.HasManyRelation,
        modelClass: OrderItem,
        join: {
          from: "orders.id",
          to: "order_items.order_id"
        }
      },
      sale: {
        relation: Objection.HasOneRelation,
        modelClass: Sale,
        filter(builder) {
          builder.where("sellable_type", "order")
        },
        beforeInsert(model) {
          model.sellable_type = "order"
        },
        join: {
          from: "orders.id",
          to: "sales.sellable_id"
        }
      }
    }
  }

  static get jsonSchema() {
    return {
      type: "object",
      properties: {
        id: { type: "integer" },
        delivered_by: { type: "object" },
        placed_by: { type: "object" },
        departments: { type: "array" },
        status: { type: "string", enum: ["pending", "fulfilled", "cancelled"] }
      }
    }
  }
}

module.exports = Order
