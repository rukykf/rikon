exports.up = function(knex) {
  knex.schema
    .createTable("suppliers", (table) => {
      table.increments("id")
      table.string("name")
      table.string("bank_name")
      table.string("account_number")
      table.boolean("active").defaultTo(true)
      table.integer("deleted_at").defaultTo(0)
      table.unique(["name", "deleted_at"])
    })
    .then(() => {
      console.log("created suppliers table")
    })
    .catch((error) => {
      console.log("could not create suppliers table")
      console.log(JSON.stringify(error))
    })
}

exports.down = function(knex) {
  knex.schema
    .dropTable("suppliers")
    .then(() => {
      console.log("dropped suppliers table")
    })
    .catch((error) => {
      console.log("could not create suppliers table")
      console.log(JSON.stringify(error))
    })
}
