const knex = require("knex")
const config = require("../../../../knexfile")

let db = null
if (process.env.NODE_ENV === "production") {
  db = knex(config.live)
} else if (process.env.NODE_ENV === "test") {
  db = knex(config.testing)
} else {
  db = knex(config.live)
}

module.exports = db
