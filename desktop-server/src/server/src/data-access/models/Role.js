const bookshelf = require("../db-config")
const User = require("./User")

const Role = bookshelf.model("Role", {
  tableName: "roles",
  users: function() {
    return this.hasMany(User)
  }
})

module.exports = Role
