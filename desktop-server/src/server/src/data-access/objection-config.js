const { Model, AjvValidator } = require("objection")
const db = require("./db-config")

Model.knex(db)

class BaseModel extends Model {
  static createValidator() {
    return new AjvValidator({
      onCreateAjv(ajv) {
        require("ajv-keywords")(ajv, "transform")
      }
    })
  }
}

module.exports = BaseModel
