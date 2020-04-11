const Objection = require("../db-config")

class SalesItem extends Objection {
  static get tableName() {
    return "sales_items"
  }

  static get relationMappings() {
    const OrderItem = require("./OrderItem")

    return {
      orderItems: {
        relation: Objection.HasManyRelation,
        modelClass: OrderItem,
        join: {
          from: "sales_items.id",
          to: "order_items.sales_item_id"
        }
      }
    }
  }
}
module.exports = SalesItem
