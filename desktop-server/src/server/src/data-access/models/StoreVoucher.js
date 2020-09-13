const { DateTime } = require("luxon")
const Objection = require("../objection-config")
const GetUniqueIdentifierForObject = require("../../utils/GetUniqueIdentifierForObject")

class StoreVoucher extends Objection {
  static get tableName() {
    return "store_vouchers"
  }

  static get virtualAttributes() {
    return ["unique_id"]
  }

  // eslint-disable-next-line camelcase
  unique_id() {
    return GetUniqueIdentifierForObject("RSV", this.id, this.created_at)
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["voucher_type"],
      properties: {
        id: { type: "integer" },
        voucher_type: {
          type: "string",
          enum: ["goods-return-note", "store-issue-voucher", "store-receipt-voucher", "damaged-goods-voucher"]
        },
        created_at: { type: "string" },
        updated_at: { type: "string" },
        physical_voucher_serial_no: { type: "string" },
        additional_details: { type: "object" },
        old_voucher_ids: { type: "array" },
        remarks: { type: "string" },
        active: { type: "boolean" }
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
          from: "store_vouchers.id",
          to: "store_ledger.store_voucher_id"
        }
      }
    }
  }
}

module.exports = StoreVoucher
