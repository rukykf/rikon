exports.up = function(knex) {
  knex.schema
    .table("sales", (table) => {
      table.integer("department_id").defaultTo(0)
      table.string("item_created_at").defaultTo("")
      table.enum("transaction_type", ["complementary", "discount", "cash", "company", "credit"]).defaultTo("cash")
      // table.dropColumn("merged_records")
    })
    .then(() => {
      console.log("modified sales table")
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
    })
}

exports.down = function(knex) {
  knex.schema
    .table("sales", (table) => {
      table.dropColumn("department_id")
      table.dropColumn("item_created_at")
      table.dropColumn("transaction_type")
      // table.json("merged_records").nullable()
    })
    .then(() => {
      console.log("dropped modifications to sales table")
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
    })
}
