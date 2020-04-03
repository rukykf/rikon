const knex = require("knex")
const bookshelfObj = require("bookshelf")
const config = require("./knexfile")
const { isDemo } = require("../../../demo-live")

let db = null
console.log("configuring DB")
console.log(isDemo())
if (isDemo()) {
  db = knex(config.demo)
} else {
  db = knex(config.live)
}

const bookshelf = bookshelfObj(db)
module.exports = bookshelf
