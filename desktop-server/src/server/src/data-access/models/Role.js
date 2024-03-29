const { ValidationError } = require("objection")
const _ = require("lodash")
const Objection = require("../objection-config")
const Permissions = require("./Permissions")

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

  static get jsonSchema() {
    return {
      type: "object",
      required: ["name", "permissions"],
      properties: {
        id: { type: "integer" },
        name: { type: "string", minLength: 1, transform: ["trim", "toLowerCase"] },
        permissions: { type: "array" }
      }
    }
  }

  $afterValidate(json) {
    if (json.permissions) {
      json.permissions.forEach((e) => {
        if (!Permissions.includes(e)) {
          throw new ValidationError({
            message: `${e} is not a valid role permission`,
            type: "InvalidRolePermissionError"
          })
        }
      })
    }
  }

  $parseDatabaseJson(json) {
    super.$parseDatabaseJson(json)
    json = _.omit(json, ["active"])
    return json
  }
}

module.exports = Role
