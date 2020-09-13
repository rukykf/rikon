const Objection = require("../objection-config")

class Supplier extends Objection {
  static get tableName() {
    return "suppliers"
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["name"],
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        bank_name: { type: "string" },
        account_number: { type: "string" }
      }
    }
  }

  static get relationMappings() {
    const StoreLedger = require("./StoreLedger")

    return {
      store_ledger_entries: {
        relation: Objection.HasManyRelation,
        modelClass: StoreLedger,
        join: {
          from: "suppliers.id",
          to: "store_ledger.supplier_id"
        }
      }
    }
  }
}

module.exports = Supplier
