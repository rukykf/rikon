const Objection = require("../db-config")

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
}

module.exports = SalesTransaction
