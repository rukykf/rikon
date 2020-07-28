const Objection = require("../objection-config")

class ManagementList extends Objection {
  static get tableName() {
    return "management_lists"
  }

  static get relationMappings() {
    const ManagementListTransaction = require("./ManagementListTransaction")

    return {
      management_list_transactions: {
        relation: Objection.HasManyRelation,
        modelClass: ManagementListTransaction,
        join: {
          from: "management_lists.id",
          to: "management_lists_transactions.management_lists_id"
        }
      }
    }
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["full_name", "list_name"],
      properties: {
        id: { type: "integer" },
        full_name: { type: "string", minLength: 1, transform: ["trim", "toLowerCase"] },
        list_name: {
          type: "string",
          enum: [
            "authorized_to_authorize",
            "authorized_for_discounts",
            "authorized_for_complementary",
            "authorized_company"
          ]
        },
        active: { type: "boolean" }
      }
    }
  }
}

module.exports = ManagementList
