exports.up = function(knex) {
  knex.schema
    .table("orders", (table) => {
      table.string("docket_serial_no").nullable()
    })
    .then(() => {
      console.log("modified orders table with docket_serial_no")
    })
    .catch((error) => {
      console.log("mysql doesn't work well with the duplicate")
    })
}

exports.down = function(knex) {
  knex.schema
    .table("orders", (table) => {
      table.dropColumn("docket_serial_no")
    })
    .then(() => {
      console.log("dropped modifications to orders table")
    })
    .catch(() => {
      console.log("failed to drop table")
    })
}
