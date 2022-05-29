exports.up = function(knex) {
  knex.schema
    .createTable("categories", (table) => {
      table.increments("id")
      table.string("name")
      table.boolean("active").defaultTo(true)
      table.integer("deleted_at").defaultTo(0)
      table.unique(["name", "deleted_at"])
    })
    .then(() => {
      console.log("created categories table")
    })
    .catch(() => {
      console.log("could not create categories table")
    })

  knex.schema
    .createTable("store_items", (table) => {
      table.increments("id")
      table.integer("category_id")
      table.string("name")
      table.float("quantity_in_receipt_unit")
      table.float("reorder_quantity_in_receipt_unit")
      table.boolean("active").defaultTo(true)
      table.integer("deleted_at").defaultTo(0)
      table.unique(["name", "deleted_at"])
    })
    .then(() => {
      console.log("created store_items table")
    })
    .catch(() => {
      console.log("could not create store_items table")
    })

  knex.schema
    .createTable("store_vouchers", (table) => {
      table.increments("id")
      table.enum("voucher_type", [
        "goods-return-note",
        "store-issue-voucher",
        "store-receipt-voucher",
        "damaged-goods-voucher"
      ])
      table.string("date")
      table.string("created_at")
      table.string("created_by")
      table.string("updated_at")
      table.string("physical_voucher_serial_no")
      table.json("old_voucher_ids")
      table.json("additional_details")
      table.string("remarks").nullable()
      table.boolean("active").defaultTo(true)
    })
    .then(() => {
      console.log("created store_vouchers table")
    })
    .catch(() => {
      console.log("could not create store_vouchers table")
    })

  knex.schema
    .createTable("units", (table) => {
      table.increments("id")
      table.integer("store_item_id")
      table.string("name")
      table.float("conversion_to_receipt_unit") // i.e 1 of y unit makes conversion_to_receipt_unit of receipt unit
      table.boolean("is_receipt_unit").defaultTo(false)
      table.boolean("is_issue_unit").defaultTo(false)
      table.boolean("active").defaultTo(true)
      table.integer("deleted_at").defaultTo(0)
      table.unique(["store_item_id", "name", "deleted_at"])
    })
    .then(() => {
      console.log("created units table")
    })
    .catch(() => {
      console.log("could not create units table")
    })

  knex.schema
    .createTable("store_ledger", (table) => {
      table.increments("id")
      table.integer("store_voucher_id")
      table.integer("store_item_id")
      table.string("created_by")
      table.integer("supplier_id").defaultTo(0)
      table.integer("department_id").defaultTo(0)
      table.integer("entry_unit_id")
      table.integer("receipt_unit_id_at_time_of_entry")
      table.float("entry_unit_conversion_to_receipt_unit_at_time_of_entry")
      table.string("date")
      table.enum("entry_type", [
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
      ])
      table.float("receipt_quantity").defaultTo(0)
      table.float("issue_quantity").defaultTo(0)
      table.float("balance_quantity_after_entry_in_receipt_unit")
      table.string("remarks")
      table.string("created_at")
      table.string("updated_at")
      table.boolean("active").defaultTo(true)
    })
    .then(() => {
      console.log("created store_ledger table")
    })
    .catch(() => {
      console.log("could not create store_ledger table")
    })

  knex.schema
    .createTable("direct_issue_notes", (table) => {
      table.increments("id")
      table.string("date").defaultTo("")
      table.string("created_at")
      table.string("updated_at")
      table.json("items")
      table.float("total")
      table.string("created_by")
      table.json("old_direct_issue_notes_ids")
      table.string("remarks").defaultTo("")
      table.string("serial_no").defaultTo("")
      table.boolean("active").defaultTo(true)
    })
    .then(() => {
      console.log("created direct_issue_notes table")
    })
    .catch((error) => {
      console.log("could not create direct_issue_notes table")
      console.log(JSON.stringify(error))
    })

  knex.schema
    .createTable("purchase_requisition_notes", (table) => {
      table.increments("id")
      table.string("date").defaultTo("")
      table.string("created_at")
      table.string("updated_at")
      table.float("estimated_total_cost")
      table.string("created_by")
      table.json("old_purchase_requisition_notes_ids")
      table.string("remarks").defaultTo("")
      table.string("serial_no").defaultTo("")
      table.boolean("active").defaultTo(true)
    })
    .then(() => {
      console.log("created purchase_requisition_notes table")
    })
    .catch(() => {
      console.log("could not create purchase_requisition_notes table")
    })

  knex.schema
    .createTable("purchase_requisition_note_items", (table) => {
      table.increments("id")
      table.string("date")
      table.string("created_at")
      table.string("purchase_requisition_note_id")
      table.integer("store_item_id")
      table.integer("unit_id")
      table.float("current_stock_balance")
      table.float("quantity_requested")
      table.float("current_market_price")
      table.float("last_purchase_price")
      table.float("estimated_total_cost")
      table.string("remarks")
      table.boolean("active").defaultTo(true)
    })
    .then(() => {
      console.log("created purchase_requisition_note_items table")
    })
    .catch(() => {
      console.log("could not create purchase_requisition_note_items table")
    })
}

exports.down = function(knex) {
  knex.schema
    .dropTable("categories")
    .then(() => {
      console.log("dropped categories table")
    })
    .catch(() => {
      console.log("could not drop categories table")
    })

  knex.schema
    .dropTable("store_items")
    .then(() => {
      console.log("dropped store_items table")
    })
    .catch(() => {
      console.log("could not drop store_items table")
    })

  knex.schema
    .dropTable("store_vouchers")
    .then(() => {
      console.log("dropped store_vouchers table")
    })
    .catch(() => {
      console.log("could not drop store_vouchers table")
    })

  knex.schema
    .dropTable("units")
    .then(() => {
      console.log("dropped units table")
    })
    .catch(() => {
      console.log("could not drop unit stable")
    })

  knex.schema
    .dropTable("store_ledger")
    .then(() => {
      console.log("dropped store_ledger table")
    })
    .catch(() => {
      console.log("could not drop store_ledger table")
    })

  knex.schema
    .dropTable("direct_issue_notes")
    .then(() => {
      console.log("dropped direct_issue_notes table")
    })
    .catch(() => {
      console.log("could not drop direct_issue_notes table")
    })
}
