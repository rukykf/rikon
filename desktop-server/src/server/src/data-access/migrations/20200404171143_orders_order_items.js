exports.up = function(knex) {
  knex.schema
    .createTable("orders", (table) => {
      table.increments("id")
      table.float("amount")
      table.string("start_date")
      table.string("close_date").nullable()
      table.enum("status", ["pending", "fulfilled", "cancelled"])
      table.json("departments")
      table.json("placed_by")
      table.json("delivered_by").nullable()
      table.string("cancellation_remarks").nullable()
    })
    .then(() => {
      console.log("created orders")
    })

  knex.schema
    .createTable("order_items", (table) => {
      table.increments("id")
      table.float("amount")
      table.integer("order_id")
      table.integer("sales_item_id")
      table.integer("quantity")
      table.string("unit")
      table.string("name")
      table.string("date")
      table.float("price_per_unit")
    })
    .then(() => {
      console.log("created order_items")
    })
}

exports.down = function(knex) {
  knex.schema.dropTable("orders").then(() => {
    console.log("dropped orders")
  })

  knex.schema.dropTable("order_items", (table) => {
    console.log("dropped order_items")
  })
}
