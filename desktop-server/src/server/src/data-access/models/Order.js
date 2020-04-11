const Objection = require("../db-config")

class Order extends Objection {
  static get tableName() {
    return "orders"
  }

  static get relationMappings() {
    const OrderItem = require("./OrderItem")
    const Sale = require("./Sale")

    return {
      orderItems: {
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
}

module.exports = Order
