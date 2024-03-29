exports.up = function(knex) {
  knex.schema
    .createTable("sales", (table) => {
      table.increments("id")
      table.string("created_at")
      table.string("updated_at")
      table.float("total_amount")
      table.float("total_paid")
      table.float("total_complementary")
      table.float("total_due")
      table.integer("sellable_id")
      table.string("sellable_type")
      table.enum("status", ["paid", "owing", "overpaid"])
      table.json("customer_details").nullable()
      table.json("credit_authorized_by").nullable()
      table.json("merged_records").nullable()
      table.boolean("active").defaultTo(true)
    })
    .then(() => {
      console.log("created sales")
    })
    .catch((error) => {
      console.log("Something went wrong")
      console.log(JSON.stringify(error))
    })

  knex.schema
    .createTable("sales_transactions", (table) => {
      table.increments("id")
      table.integer("sales_id")
      table.string("date")
      table.enum("transaction_type", [
        "cash",
        "pos",
        "transfer",
        "discount",
        "complementary",
        "reverse-cash",
        "reverse-pos",
        "reverse-transfer",
        "reverse-discount"
      ])
      table.float("amount")
      table.string("registered_by")
      table.boolean("active").defaultTo(true)
    })
    .then(() => {
      console.log("created sales_transactions")
    })
    .catch((error) => {
      console.log("Something went wrong")
      console.log(JSON.stringify(error))
    })
}

exports.down = function(knex) {
  knex.schema
    .dropTable("sales_transactions")
    .then(() => {
      console.log("dropped sales_transactions")
    })
    .catch((error) => {
      console.log("Something went wrong")
      console.log(JSON.stringify(error))
    })

  knex.schema
    .dropTable("sales")
    .then(() => {
      console.log("dropped sales")
    })
    .catch((error) => {
      console.log("Something went wrong")
      console.log(JSON.stringify(error))
    })
}
