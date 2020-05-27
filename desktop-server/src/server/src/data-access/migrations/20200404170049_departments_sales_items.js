exports.up = function(knex) {
  knex.schema
    .createTable("departments", (table) => {
      table.increments("id")
      table.string("name")
      table.integer("deleted_at").defaultTo(0)
      table.unique(["name", "deleted_at"])
      table.boolean("active").defaultTo(true)
    })
    .then(() => {
      console.log("created departments")
    })

  knex.schema
    .createTable("sales_items", (table) => {
      table.increments("id")
      table.string("name")
      table.string("unit")
      table.float("price_per_unit")
      table.integer("department_id")
      table.integer("deleted_at").defaultTo(0)
      table.unique(["name", "deleted_at"])
      table.boolean("active").defaultTo(true)
    })
    .then(() => {
      console.log("created sales_items")
    })
}

exports.down = function(knex) {
  knex.schema.dropTable("departments").then(() => {
    console.log("dropped departments")
  })
  knex.schema.dropTable("sales_items").then(() => {
    console.log("dropped sales_items")
  })
}
