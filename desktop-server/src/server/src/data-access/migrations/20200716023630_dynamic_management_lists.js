exports.up = function(knex) {
  knex.schema
    .createTable("management_lists", (table) => {
      table.increments("id")
      table.string("full_name")
      table.enum("list_name", [
        "authorized_to_authorize",
        "authorized_for_discounts",
        "authorized_for_complementary",
        "authorized_company"
      ])
      table.integer("deleted_at").defaultTo(0)
      table.unique(["full_name", "list_name", "deleted_at"])
      table.boolean("active").defaultTo(true)
    })
    .then(() => {
      console.log("created management_lists")
    })

  knex.schema
    .createTable("management_lists_transactions", (table) => {
      table.increments("id")
      table.integer("management_list_item_id")
      table.enum("transaction_type", ["discount", "complementary", "debt"]).defaultTo("discount")
      table.integer("department_id")
      table.integer("sales_id")
      table.string("created_at")
      table.string("active").defaultTo(true)
    })
    .then(() => {
      console.log("created management_lists_transactions")
    })
}

exports.down = function(knex) {
  knex.schema.dropTable("management_lists").then(() => {
    console.log("dropped management_lists")
  })

  knex.schema.dropTable("management_lists_transactions").then(() => {
    console.log("dropped management_lists_transactions")
  })
}
