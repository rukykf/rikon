const Objection = require("../db-config")
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
}
module.exports = User
