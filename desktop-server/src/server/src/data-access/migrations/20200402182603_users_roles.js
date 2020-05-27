exports.up = function(knex) {
  knex.schema
    .createTable("roles", (table) => {
      table.increments("id")
      table.string("name")
      table.json("permissions")
      table.integer("deleted_at").defaultTo(0)
      table.unique(["name", "deleted_at"])
      table.boolean("active").defaultTo(true)
    })
    .then(() => {
      console.log("created roles")
    })

  knex.schema
    .createTable("users", (table) => {
      table.increments("id")
      table.string("username")
      table.string("first_name")
      table.string("last_name")
      table.string("password")
      table.integer("role_id")
      table.boolean("active").defaultTo(true)
      table.integer("deleted_at").defaultTo(0)
      table.unique(["username", "deleted_at"])
    })
    .then(() => {
      console.log("created users")
    })
}

exports.down = function(knex) {
  knex.schema.dropTable("roles").then(() => {
    console.log("dropped roles")
  })
  knex.schema.dropTable("users").then(() => {
    console.log("dropped users")
  })
}
