const { DateTime } = require("luxon")
const Objection = require("../objection-config")

class ManagementListTransaction extends Objection {
  static get tableName() {
    return "management_lists_transactions"
  }

  static get relationMappings() {
    const ManagementList = require("./ManagementList")
    const Sale = require("./Sale")

    return {
      management_list_item: {
        relation: Objection.HasOneRelation,
        modelClass: ManagementList,
        join: {
          from: "management_lists_transactions.management_list_item_id",
          to: "management_lists.id"
        }
      },
      sale: {
        relation: Objection.HasOneRelation,
        modelClass: Sale,
        join: {
          from: "management_lists_transactions.sales_id",
          to: "sales.id"
        }
      }
    }
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["management_list_item_id", "sales_id"],
      properties: {
        id: { type: "integer" },
        management_lists_id: { type: "integer" },
        sales_id: { type: "integer" },
        created_at: { type: "string" }
      }
    }
  }

  $beforeInsert(queryContext) {
    if (this.created_at == null) {
      this.created_at = DateTime.local().toISO()
    }
    super.$beforeInsert(queryContext)
  }
}

module.exports = ManagementListTransaction
