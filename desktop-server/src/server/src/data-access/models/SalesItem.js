const { ValidationError } = require("objection")
const _ = require("lodash")
const Objection = require("../objection-config")

class SalesItem extends Objection {
  static get tableName() {
    return "sales_items"
  }

  static get relationMappings() {
    const OrderItem = require("./OrderItem")
    const Department = require("./Department")
    const Order = require("./Order")

    return {
      order_items: {
        relation: Objection.HasManyRelation,
        modelClass: OrderItem,
        join: {
          from: "sales_items.id",
          to: "order_items.sales_item_id"
        }
      },
      department: {
        relation: Objection.BelongsToOneRelation,
        modelClass: Department,
        join: {
          from: "sales_items.department_id",
          to: "departments.id"
        }
      },
      orders: {
        relation: Objection.ManyToManyRelation,
        modelClass: Order,
        join: {
          from: "sales_items.id",
          through: {
            from: "order_items.sales_item_id",
            to: "order_items.order_id"
          },
          to: "orders.id"
        }
      }
    }
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["name", "unit", "price_per_unit", "department_id"],
      properties: {
        id: { type: "integer" },
        name: { type: "string", minLength: 1, transform: ["trim", "toLowerCase"] },
        unit: { type: "string", minLength: 1, transform: ["trim", "toLowerCase"] },
        price_per_unit: { type: "number" },
        department_id: { type: "integer" }
      }
    }
  }

  $parseDatabaseJson(json) {
    super.$parseDatabaseJson(json)
    json = _.omit(json, ["active"])
    return json
  }
}

module.exports = SalesItem
