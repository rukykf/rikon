const { ValidationError } = require("objection")
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

  async validateUnique() {
    if (this.username) {
      let existingUser = await User.query()
        .where("username", "=", this.username.toLowerCase())
        .first()

      if (existingUser != null) {
        throw new ValidationError({
          message: "This username is already taken, try another one",
          type: "NewUserValidation"
        })
      }
    }
  }

  async $beforeInsert() {
    await this.validateUnique()
  }

  async $beforeUpdate() {
    await this.validateUnique()
  }
}
module.exports = User
