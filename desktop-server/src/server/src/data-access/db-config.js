const knex = require("knex")
const config = require("../../../../knexfile")

let db = null
if (process.env.NODE_ENV === "development") {
  db = knex(config.demo)
} else if (process.env.NODE_ENV === "test") {
  db = knex(config.testing)
} else {
  db = knex(config.live)
}

module.exports = db
