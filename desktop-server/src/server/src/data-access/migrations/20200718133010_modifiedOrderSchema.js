exports.up = function(knex) {
  knex.schema
    .table("orders", (table) => {
      table.boolean("active").defaultTo(true)
      table.json("old_order_ids").nullable()
      table.string("docket_serial_no").nullable()
    })
    .then(() => {
      console.log("modified orders table")
    })
}

exports.down = function(knex) {
  knex.schema
    .table("orders", (table) => {
      table.dropColumn("active")
      table.dropColumn("old_order_ids")
      table.dropColumn("docket_serial_no")
    })
    .then(() => {
      console.log("dropped modifications to orders table")
    })
}
