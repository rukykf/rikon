const bookshelf = require("../db-config")
const Role = require("./Role")

const User = bookshelf.model("User", {
  tableName: "users",
  role: function() {
    return this.belongsTo(Role)
  }
})

module.exports = User
