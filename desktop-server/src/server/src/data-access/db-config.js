const knex = require("knex")
const { Model } = require("objection")
const config = require("./knexfile")
// const { isDemo } = require("../../../demo-live")

function isDemo() {
  return true
}

let db = null
console.log("configuring DB")
console.log(isDemo())
if (isDemo()) {
  db = knex(config.demo)
} else {
  db = knex(config.live)
}

const Objection = Model.knex(knex)
module.exports = Objection
