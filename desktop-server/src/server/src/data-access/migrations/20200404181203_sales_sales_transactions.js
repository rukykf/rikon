exports.up = function(knex) {
  knex.schema
    .createTable("sales", (table) => {
      table.increments("id")
      table.timestamps()
      table.float("total_amount")
      table.float("total_paid")
      table.float("total_complementary")
      table.float("total_due")
      table.integer("sellable_id")
      table.string("sellable_type")
      table.enum("status", ["paid", "owing"])
      table.json("customer_details").nullable()
    })
    .then(() => {
      console.log("created sales")
    })

  knex.schema
    .createTable("sales_transactions", (table) => {
      table.increments("id")
      table.integer("sales_id")
      table.string("date")
      table.enum("payment_method", ["cash", "pos", "transfer", "discount", "complementary"])
      table.float("amount")
      table.string("committed_by")
    })
    .then(() => {
      console.log("created sales_transactions")
    })
}

exports.down = function(knex) {
  knex.schema.dropTable("sales_transactions").then(() => {
    console.log("dropped sales_transactions")
  })

  knex.schema.dropTable("sales").then(() => {
    console.log("dropped sales")
  })
}
