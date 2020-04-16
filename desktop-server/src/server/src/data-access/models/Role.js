const { ValidationError } = require("objection")
const Objection = require("../db-config")
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

  async $beforeInsert() {
    await this.validateUnique()
  }

  async $beforeUpdate() {
    await this.validateUnique()
  }

  async validateUnique() {
    if (this.name) {
      let existingRole = await Role.query()
        .where("name", "=", this.name.toLowerCase())
        .first()

      if (existingRole != null) {
        throw new ValidationError({
          message: "this name is already assigned to another role",
          type: "NewRoleNameValidation"
        })
      }
    }
  }
}

module.exports = Role
