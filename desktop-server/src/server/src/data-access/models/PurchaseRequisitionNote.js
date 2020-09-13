const { DateTime } = require("luxon")
const Objection = require("../objection-config")
const GetUniqueIdentifierForObject = require("../../utils/GetUniqueIdentifierForObject")

class PurchaseRequisitionNote extends Objection {
  static get tableName() {
    return "purchase_requisition_notes"
  }

  static get virtualAttributes() {
    return ["unique_id"]
  }

  // eslint-disable-next-line camelcase
  unique_id() {
    return GetUniqueIdentifierForObject("RPRN", this.id, this.created_at)
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: [],
      properties: {
        id: { type: "integer" },
        date: { type: "string" },
        active: { type: "boolean" },
        estimated_total_cost: { type: "number" },
        old_purchase_requisition_notes_ids: { type: "array" },
        created_by: { type: "string" },
        remarks: { type: "string" },
        serial_no: { type: "string" }
      }
    }
  }

  static get relationMappings() {
    const PurchaseRequisitionNoteItem = require("./PurchaseRequisitionNoteItem")

    return {
      purchase_items: {
        relation: Objection.HasManyRelation,
        modelClass: PurchaseRequisitionNoteItem,
        join: {
          from: "purchase_requisition_notes.id",
          to: "purchase_requisition_note_items.purchase_requisition_note_id"
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

module.exports = PurchaseRequisitionNote
