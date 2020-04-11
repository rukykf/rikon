const Objection = require("../db-config")

class Department extends Objection {
  static get tableName() {
    return "departments"
  }
}
module.exports = Department
