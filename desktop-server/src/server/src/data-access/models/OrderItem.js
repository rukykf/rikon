const Objection = require("../objection-config")

class OrderItem extends Objection {
  static get tableName() {
    return "order_items"
  }

  static get relationMappings() {
    const SalesItem = require("./SalesItem")
    const Order = require("./Order")

    return {
      salesItem: {
        relation: Objection.BelongsToOneRelation,
        modelClass: SalesItem,
        join: {
          from: "order_items.sales_item_id",
          to: "sales_items.id"
        }
      },
      order: {
        relation: Objection.BelongsToOneRelation,
        modelClass: Order,
        join: {
          from: "order_items.order_id",
          to: "orders.id"
        }
      }
    }
  }
}
module.exports = OrderItem
