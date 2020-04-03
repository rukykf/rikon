exports.up = function(knex) {
  knex.schema
    .createTable("users", (table) => {
      table.increments("id")
      table.string("username")
      table.string("first_name")
      table.string("last_name")
      table.string("password")
    })
    .then(() => {
      console.log("fulfilled")
    })
}

exports.down = function(knex) {
  knex.schema.dropTable("users").then(() => {
    console.log("rejected")
  })
}
