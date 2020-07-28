const { ValidationError } = require("objection")
const _ = require("lodash")
const Objection = require("../objection-config")

class Department extends Objection {
  static get tableName() {
    return "departments"
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["name"],
      properties: {
        id: { type: "integer" },
        name: { type: "string", minLength: 1, transform: ["trim", "toLowerCase"] },
        active: { type: "boolean" }
      }
    }
  }

  $parseDatabaseJson(json) {
    json = super.$parseDatabaseJson(json)
    return _.pick(json, ["id", "name"])
  }
}

module.exports = Department
