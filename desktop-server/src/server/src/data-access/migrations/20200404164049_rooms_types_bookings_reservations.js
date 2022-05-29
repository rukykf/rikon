exports.up = function(knex) {
  knex.schema
    .createTable("room_types", (table) => {
      table.increments("id")
      table.float("price_per_night")
      table.string("name")
      table.integer("deleted_at").defaultTo(0)
      table.unique(["name", "deleted_at"])
      table.boolean("active").defaultTo(true)
    })
    .then(() => {
      console.log("created room_types")
    })
    .catch((error) => {
      console.log("Something went wrong")
      console.log(JSON.stringify(error))
    })

  knex.schema
    .createTable("rooms", (table) => {
      table.increments("id")
      table.integer("room_no")
      table.integer("room_type_id")
      table.integer("deleted_at").defaultTo(0)
      table.unique(["room_no", "deleted_at"])
      table.boolean("active").defaultTo(true)
    })
    .then(() => {
      console.log("created rooms")
    })
    .catch((error) => {
      console.log("Something went wrong")
      console.log(JSON.stringify(error))
    })

  knex.schema
    .createTable("bookings", (table) => {
      table.increments("id")
      table.string("created_at")
      table.string("updated_at")
      table.string("start_date")
      table.string("end_date").nullable()
      table.float("price_per_night")
      table.integer("room_id")
      table.json("customer_details")
      table.enum("status", ["closed", "open", "cancelled"]).defaultTo("open")
    })
    .then(() => {
      console.log("created bookings")
    })
    .catch((error) => {
      console.log("Something went wrong")
      console.log(JSON.stringify(error))
    })

  knex.schema
    .createTable("reservations", (table) => {
      table.increments("id")
      table.integer("room_id")
      table.string("created_at")
      table.string("updated_at")
      table.string("start_date")
      table.string("end_date")
      table.json("customer_details")
      table.enum("status", ["open", "closed", "cancelled"]).defaultTo("open")
    })
    .then(() => {
      console.log("created reservations")
    })
    .catch((error) => {
      console.log("Something went wrong")
      console.log(JSON.stringify(error))
    })
}

exports.down = function(knex) {
  knex.schema
    .dropTable("rooms")
    .then(() => {
      console.log("dropped rooms")
    })
    .catch((error) => {
      console.log("Something went wrong")
      console.log(JSON.stringify(error))
    })
  knex.schema
    .dropTable("room_types")
    .then(() => {
      console.log("dropped room_types")
    })
    .catch((error) => {
      console.log("Something went wrong")
      console.log(JSON.stringify(error))
    })
  knex.schema
    .dropTable("bookings", () => {
      console.log("dropped bookings")
    })
    .catch((error) => {
      console.log("Something went wrong")
      console.log(JSON.stringify(error))
    })
  knex.schema
    .dropTable("reservations")
    .then(() => {
      console.log("dropped reservations")
    })
    .catch((error) => {
      console.log("Something went wrong")
      console.log(JSON.stringify(error))
    })
}
