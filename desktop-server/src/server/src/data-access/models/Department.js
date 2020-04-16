const Objection = require("../db-config")
const { ValidationError } = require("objection")

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
        name: { type: "string", minLength: 1, transform: ["trim", "toLowerCase"] }
      }
    }
  }

  async validateUnique() {
    if (this.name) {
      let existingDepartment = await Department.query()
        .where("name", "=", this.name.toLowerCase())
        .first()

      if (existingDepartment != null) {
        throw new ValidationError({
          message: "this name is already assigned to another department",
          type: "NewDepartmentNameValidation"
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
module.exports = Department
