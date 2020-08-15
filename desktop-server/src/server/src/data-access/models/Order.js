const Objection = require("../objection-config")
const GetUniqueIdentifierForObject = require("../../utils/GetUniqueIdentifierForObject")

class Order extends Objection {
  static get tableName() {
    return "orders"
  }

  static get virtualAttributes() {
    return ["unique_id"]
  }

  // eslint-disable-next-line camelcase
  unique_id() {
    return GetUniqueIdentifierForObject("RO", this.id, this.created_at)
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
        status: { type: "string", enum: ["pending", "fulfilled", "cancelled"] },
        old_order_ids: { type: "array" },
        docket_serial_no: { type: "string" }
      }
    }
  }
}

module.exports = Order
