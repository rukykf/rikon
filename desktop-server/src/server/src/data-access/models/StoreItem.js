const Objection = require("../objection-config")

class StoreItem extends Objection {
  static get tableName() {
    return "store_items"
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["name", "category_id"],
      properties: {
        id: { type: "integer" },
        category_id: { type: "integer" },
        name: { type: "string" },
        quantity_in_receipt_unit: { type: "number" },
        reorder_quantity_in_receipt_unit: { type: "number" },
        active: { type: "boolean" }
      }
    }
  }

  static get relationMappings() {
    const Category = require("./Category")
    const Unit = require("./Unit")
    const StoreLedger = require("./StoreLedger")
    const PurchaseRequisitionNoteItem = require("./PurchaseRequisitionNoteItem")

    return {
      category: {
        relation: Objection.BelongsToOneRelation,
        modelClass: Category,
        join: {
          from: "store_items.category_id",
          to: "categories.id"
        }
      },

      receipt_unit: {
        relation: Objection.HasOneRelation,
        modelClass: Unit,
        filter(builder) {
          builder.where("is_receipt_unit", 1)
        },
        join: {
          from: "store_items.id",
          to: "units.store_item_id"
        }
      },

      issue_unit: {
        relation: Objection.HasOneRelation,
        modelClass: Unit,
        filter(builder) {
          builder.where("is_issue_unit", 1)
        },
        join: {
          from: "store_items.id",
          to: "units.store_item_id"
        }
      },

      units: {
        relation: Objection.HasManyRelation,
        modelClass: Unit,
        join: {
          from: "store_items.id",
          to: "units.store_item_id"
        }
      },

      ledger_entries: {
        relation: Objection.HasManyRelation,
        modelClass: StoreLedger,
        join: {
          from: "store_items.id",
          to: "store_ledger.store_item_id"
        }
      },

      purchase_items: {
        relation: Objection.HasManyRelation,
        modelClass: PurchaseRequisitionNoteItem,
        join: {
          from: "store_items.id",
          to: "purchase_requisition_note_items.store_item_id"
        }
      }
    }
  }
}

module.exports = StoreItem
