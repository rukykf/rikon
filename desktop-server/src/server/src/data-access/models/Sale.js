const { DateTime } = require("luxon")
const Objection = require("../objection-config")
const GetUniqueIdentifierForObject = require("../../utils/GetUniqueIdentifierForObject")

class Sale extends Objection {
  static get tableName() {
    return "sales"
  }

  static get virtualAttributes() {
    return ["unique_id"]
  }

  // eslint-disable-next-line camelcase
  unique_id() {
    return GetUniqueIdentifierForObject("RS", this.id, this.created_at)
  }

  static get relationMappings() {
    const SalesTransaction = require("./SalesTransaction")
    const ManagementListTransaction = require("./ManagementListTransaction")
    const Booking = require("./Booking")
    const Order = require("./Order")
    const Department = require("./Department")

    return {
      sales_transactions: {
        relation: Objection.HasManyRelation,
        modelClass: SalesTransaction,
        join: {
          from: "sales.id",
          to: "sales_transactions.sales_id"
        }
      },

      department: {
        relation: Objection.BelongsToOneRelation,
        modelClass: Department,
        join: {
          from: "sales.department_id",
          to: "departments.id"
        }
      },

      management_lists_transaction: {
        relation: Objection.HasOneRelation,
        modelClass: ManagementListTransaction,
        join: {
          from: "sales.id",
          to: "management_lists_transactions.sales_id"
        }
      },

      booking: {
        relation: Objection.BelongsToOneRelation,
        modelClass: Booking,
        join: {
          from: "sales.sellable_id",
          to: "bookings.id"
        }
      },

      order: {
        relation: Objection.BelongsToOneRelation,
        modelClass: Order,
        join: {
          from: "sales.sellable_id",
          to: "orders.id"
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
        "status",
        "department_id",
        "transaction_type"
      ],
      properties: {
        id: { type: "integer" },
        total_amount: { type: "number" },
        total_paid: { type: "number" },
        total_complementary: { type: "number" },
        total_due: { type: "number" },
        sellable_id: { type: "integer" },
        sellable_type: { type: "string", enum: ["booking", "order"] },
        department_id: { type: "integer" },
        transaction_type: { type: "string", enum: ["complementary", "discount", "cash", "company", "credit"] },
        remarks: { type: "string" },
        item_created_at: { type: "string" },
        customer_details: { type: "object" },
        credit_authorized_by: { type: "object" },
        merged_records: { type: "array" },
        status: { type: "string", enum: ["paid", "owing", "overpaid"] },
        active: { type: "boolean" }
      }
    }
  }

  $beforeInsert(queryContext) {
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
