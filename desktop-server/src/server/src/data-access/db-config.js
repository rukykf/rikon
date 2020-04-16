const knex = require("knex")
const { Model } = require("objection")
const config = require("./knexfile")
const { AjvValidator } = require("objection")

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

Model.knex(db)

class BaseModel extends Model {
  static createValidator() {
    return new AjvValidator({
      onCreateAjv(ajv) {
        require("ajv-keywords")(ajv)
      }
    })
  }
}

module.exports = BaseModel
