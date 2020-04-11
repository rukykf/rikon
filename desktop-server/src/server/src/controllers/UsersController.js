const { User } = require("../data-access/models/User")

module.exports = {
  async index(req, res) {
    let users = await User.fetchAll({
      withRelated: ["role"]
    })

    let usersJson = users.toJSON()
    let usersCollection = []
    usersJson.forEach((e) => {
      usersCollection.push({
        id: e.id,
        first_name: e.first_name,
        last_name: e.last_name,
        username: e.username,
        role: e.role.name
      })
    })
    return res.json(usersCollection)
  }
}
