exports.up = function(knex) {
  knex.schema
    .table("sales", (table) => {
      table.integer("department_id").defaultTo(0)
      table.string("item_created_at").defaultTo("")
      table.enum("transaction_type", ["complementary", "discount", "cash", "company", "credit"]).defaultTo("cash")
      table.string("remarks").defaultTo("")
      // table.dropColumn("merged_records")
    })
    .then(() => {
      console.log("modified sales table")
    })
}

exports.down = function(knex) {
  knex.schema
    .table("sales", (table) => {
      table.dropColumn("department_id")
      table.dropColumn("remarks")
      table.dropColumn("transaction_type")
      // table.json("merged_records").nullable()
    })
    .then(() => {
      console.log("dropped modifications to sales table")
    })
}
