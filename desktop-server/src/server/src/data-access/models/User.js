const _ = require("lodash")
const Objection = require("../objection-config")
const Role = require("./Role")

class User extends Objection {
  static get tableName() {
    return "users"
  }

  static get relationMappings() {
    return {
      role: {
        relation: Objection.BelongsToOneRelation,
        modelClass: Role,
        join: {
          from: "users.role_id",
          to: "roles.id"
        }
      }
    }
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["username", "first_name", "last_name", "password", "role_id"],
      properties: {
        id: { type: "integer" },
        username: { type: "string", minLength: 1, transform: ["trim", "toLowerCase"] },
        first_name: { type: "string", minLength: 2, transform: ["trim", "toLowerCase"] },
        last_name: { type: "string", minLength: 2, transform: ["trim", "toLowerCase"] },
        password: { type: "string", minLength: 1, transform: ["trim", "toLowerCase"] },
        role_id: { type: "integer" }
      }
    }
  }

  $parseDatabaseJson(json) {
    super.$parseDatabaseJson(json)
    json = _.omit(json, ["active"])
    return json
  }
}
module.exports = User
