exports.up = function(knex) {
  knex.schema
    .createTable("room_types", (table) => {
      table.increments("id")
      table.float("price_per_night")
      table.string("name")
      table.boolean("active").defaultTo(true)
    })
    .then(() => {
      console.log("created room_types")
    })

  knex.schema
    .createTable("rooms", (table) => {
      table.increments("id")
      table.integer("room_no")
      table.integer("room_type_id")
      table.boolean("active").defaultTo(true)
    })
    .then(() => {
      console.log("created rooms")
    })

  knex.schema
    .createTable("bookings", (table) => {
      table.increments("id")
      table.timestamps()
      table.date("start_date")
      table.date("end_date").nullable()
      table.float("price_per_night")
      table.integer("room_id")
      table.json("customer_details")
      table.enum("status", ["closed", "open", "cancelled"]).defaultTo("open")
    })
    .then(() => {
      console.log("created bookings")
    })

  knex.schema
    .createTable("reservations", (table) => {
      table.increments("id")
      table.integer("room_id")
      table.timestamps()
      table.date("start_date")
      table.date("end_date")
      table.json("customer_details")
      table.enum("status", ["open", "closed", "cancelled"]).defaultTo("open")
    })
    .then(() => {
      console.log("created reservations")
    })
}

exports.down = function(knex) {
  knex.schema.dropTable("rooms").then(() => {
    console.log("dropped rooms")
  })
  knex.schema.dropTable("room_types").then(() => {
    console.log("dropped room_types")
  })
  knex.schema.dropTable("bookings", () => {
    console.log("dropped bookings")
  })
  knex.schema.dropTable("reservations").then(() => {
    console.log("dropped reservations")
  })
}
