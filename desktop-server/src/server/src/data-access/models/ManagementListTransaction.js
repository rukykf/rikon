const { DateTime } = require("luxon")
const Objection = require("../objection-config")
const GetUniqueIdentifierForObject = require("../../utils/GetUniqueIdentifierForObject")

class ManagementListTransaction extends Objection {
  static get tableName() {
    return "management_lists_transactions"
  }

  static get virtualAttributes() {
    return ["unique_id"]
  }

  // eslint-disable-next-line camelcase
  unique_id() {
    return GetUniqueIdentifierForObject("RT", this.id, this.created_at)
  }

  static get relationMappings() {
    const ManagementList = require("./ManagementList")
    const Sale = require("./Sale")
    const Department = require("./Department")

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
      },

      department: {
        relation: Objection.HasOneRelation,
        modelClass: Department,
        join: {
          from: "management_lists_transactions.department_id",
          to: "departments.id"
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
        created_at: { type: "string" },
        department_id: { type: "integer" },
        transaction_type: { type: "string", enum: ["discount", "complementary", "debt"] }
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
