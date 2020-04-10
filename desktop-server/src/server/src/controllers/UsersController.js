const User = require("../data-access/models/User")

module.exports = {
  index: async function(req, res) {
    let users = await User.fetchAll()
    return users
  }
}
