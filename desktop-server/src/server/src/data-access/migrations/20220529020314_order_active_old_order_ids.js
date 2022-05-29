exports.up = function(knex) {
    knex.schema
    .table("orders", (table) => {
      table.boolean("active").defaultTo(true)
      table.json("old_order_ids").defaultTo("[]")
    })
    .then(() => {
      console.log("modified orders table")
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
    })  
};

exports.down = function(knex) {
    knex.schema
    .table("orders", (table) => {
      table.dropColumn("active")
      table.dropColumn("old_order_ids")

    })
    .then(() => {
      console.log("dropped modifications to orders table")
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
    })
};
