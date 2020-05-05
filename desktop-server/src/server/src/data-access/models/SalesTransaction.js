const { DateTime } = require("luxon")
const Objection = require("../objection-config")

class SalesTransaction extends Objection {
  static get tableName() {
    return "sales_transactions"
  }

  static get relationMappings() {
    const Sale = require("./Sale")
    return {
      sale: {
        relation: Objection.BelongsToOneRelation,
        modelClass: Sale,
        join: {
          from: "sales_transactions.sales_id",
          to: "sales.id"
        }
      }
    }
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["sales_id", "transaction_type", "amount", "registered_by", "date"],
      properties: {
        id: { type: "integer" },
        sales_id: { type: "integer" },
        transaction_type: {
          type: "string",
          enum: ["cash", "pos", "transfer", "discount", "complementary"],
          transform: ["trim"]
        },
        amount: { type: "number", transform: ["trim"] },
        registered_by: { type: "string", transform: ["trim"] },
        date: { type: "string" }
      }
    }
  }

  $beforeInsert(queryContext) {
    this.date = DateTime.local().toISODate()
    super.$beforeInsert(queryContext)
  }
}

module.exports = SalesTransaction
