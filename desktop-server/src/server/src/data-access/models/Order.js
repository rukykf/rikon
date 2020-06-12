const Objection = require("../objection-config")

class Order extends Objection {
  static get tableName() {
    return "orders"
  }

  static get relationMappings() {
    const OrderItem = require("./OrderItem")
    const Sale = require("./Sale")
    const SalesItem = require("./SalesItem")

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
      },
      sales_item: {
        relation: Objection.ManyToManyRelation,
        modelClass: SalesItem,
        join: {
          from: "orders.id",
          through: {
            from: "order_items.order_id",
            to: "order_items.sales_item_id"
          },
          to: "sales_items.id"
        }
      }
    }
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["placed_by", "departments", "status"],
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
