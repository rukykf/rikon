const bookshelf = require("../db-config")

const Department = bookshelf.model("Department", {
  tableName: "departments"
})

module.exports = Department
