const { DateTime } = require("luxon")
const Objection = require("../objection-config")

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

  static get jsonSchema() {
    return {
      type: "object",
      required: [
        "total_amount",
        "total_paid",
        "total_complementary",
        "total_due",
        "sellable_id",
        "sellable_type",
        "status"
      ],
      properties: {
        id: { type: "integer" },
        total_amount: { type: "number" },
        total_paid: { type: "number" },
        total_complementary: { type: "number" },
        total_due: { type: "number" },
        sellable_id: { type: "integer" },
        sellable_type: { type: "string", enum: ["booking", "order"] },
        customer_details: { type: "object" },
        credit_authorized_by: { type: "object" },
        merged_records: { type: "array" },
        status: { type: "string", enum: ["paid", "owing", "overpaid"] }
      }
    }
  }

  $beforeInsert(queryContext) {
    // booking timestamps need to store the time
    if (this.created_at == null) {
      this.created_at = DateTime.local().toISO()
    }

    this.updated_at = DateTime.local().toISO()
    super.$beforeInsert(queryContext)
  }

  $beforeUpdate(opt, queryContext) {
    this.updated_at = DateTime.local().toISO()
    super.$beforeUpdate(opt, queryContext)
  }
}
module.exports = Sale
