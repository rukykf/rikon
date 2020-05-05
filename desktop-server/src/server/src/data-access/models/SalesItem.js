const { ValidationError } = require("objection")
const _ = require("lodash")
const Objection = require("../objection-config")
const Department = require("./Department")

class SalesItem extends Objection {
  static get tableName() {
    return "sales_items"
  }

  static get relationMappings() {
    const OrderItem = require("./OrderItem")

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

  async validateUnique() {
    if (this.name) {
      let existingItem = await SalesItem.query()
        .where("name", "=", this.name.toLowerCase())
        .andWhere("active", "=", 1)
        .first()

      if (existingItem != null) {
        throw new ValidationError({
          message: "a sales item with this name already exists",
          type: "NewSalesItemNameValidation"
        })
      }
    }
  }

  async $beforeInsert() {
    await this.validateUnique()
  }

  async $beforeUpdate() {
    await this.validateUnique()
  }

  $parseDatabaseJson(json) {
    super.$parseDatabaseJson(json)
    json = _.omit(json, ["active"])
    return json
  }
}
module.exports = SalesItem
