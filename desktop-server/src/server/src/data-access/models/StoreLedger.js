const { DateTime } = require("luxon")
const Objection = require("../objection-config")
const GetUniqueIdentifierForObject = require("../../utils/GetUniqueIdentifierForObject")

class StoreLedger extends Objection {
  static get tableName() {
    return "store_ledger"
  }

  static get virtualAttributes() {
    return ["unique_id"]
  }

  // eslint-disable-next-line camelcase
  unique_id() {
    return GetUniqueIdentifierForObject("RSL", this.id, this.created_at)
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["store_item_id", "entry_unit_id", "receipt_unit_id_at_time_of_entry", "entry_type"],
      properties: {
        id: { type: "integer" },
        entry_type: {
          type: "string",
          enum: [
            "issue",
            "receipt",
            "damages",
            "goods-return",
            "opening-balance",
            "reverse-issue",
            "reverse-receipt",
            "reverse-damages",
            "reverse-goods-return",
            "reverse-opening-balance"
          ]
        },
        store_voucher_id: { type: "integer" },
        store_item_id: { type: "integer" },
        supplier_id: { type: "integer" },
        department_id: { type: "integer" },
        entry_unit_id: { type: "integer" },
        receipt_unit_id_at_time_of_entry: { type: "integer" },
        entry_unit_conversion_to_receipt_unit_at_time_of_entry: { type: "number" },
        date: { type: "string" },
        receipt_quantity: { type: "number" },
        issue_quantity: { type: "number" },
        balance_quantity_after_entry_in_receipt_unit: { type: "number" },
        created_at: { type: "string" },
        updated_at: { type: "string" }
      }
    }
  }

  static get relationMappings() {
    const StoreVoucher = require("./StoreVoucher")
    const StoreItem = require("./StoreItem")
    const Supplier = require("./Supplier")
    const Department = require("./Department")
    const Unit = require("./Unit")

    return {
      store_voucher: {
        relation: Objection.BelongsToOneRelation,
        modelClass: StoreVoucher,
        join: {
          from: "store_ledger.store_voucher_id",
          to: "store_vouchers.id"
        }
      },

      store_item: {
        relation: Objection.BelongsToOneRelation,
        modelClass: StoreItem,
        join: {
          from: "store_ledger.store_item_id",
          to: "store_items.id"
        }
      },

      supplier: {
        relation: Objection.BelongsToOneRelation,
        modelClass: Supplier,
        join: {
          from: "store_ledger.supplier_id",
          to: "suppliers.id"
        }
      },

      department: {
        relation: Objection.BelongsToOneRelation,
        modelClass: Department,
        join: {
          from: "store_ledger.department_id",
          to: "departments.id"
        }
      },

      unit_of_entry: {
        relation: Objection.BelongsToOneRelation,
        modelClass: Unit,
        join: {
          from: "store_ledger.entry_unit_id",
          to: "units.id"
        }
      },

      main_unit_at_time_of_entry: {
        relation: Objection.BelongsToOneRelation,
        modelClass: Unit,
        join: {
          from: "store_ledger.main_unit_id_at_time_of_entry",
          to: "units.id"
        }
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

module.exports = StoreLedger
