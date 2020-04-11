const Objection = require("../db-config")

class Sale extends Objection {
  static get tableName() {
    return "sales"
  }

  static get relationMappings() {
    const SalesTransaction = require("./SalesTransaction")
    return {
      salesTransactions: {
        relation: Objection.HasManyRelation,
        modelClass: SalesTransaction,
        join: {
          from: "sales.id",
          to: "sales_transactions.sales_id"
        }
      }
    }
  }
}
module.exports = Sale
