const Objection = require("../db-config")

class Role extends Objection {
  static get tableName() {
    return "roles"
  }

  static get relationMappings() {
    const User = require("./User")

    return {
      user: {
        relation: Objection.HasManyRelation,
        modelClass: User,
        join: {
          from: "roles.id",
          to: "users.role_id"
        }
      }
    }
  }
}

module.exports = Role
