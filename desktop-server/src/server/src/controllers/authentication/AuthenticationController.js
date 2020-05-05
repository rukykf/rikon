const _ = require("lodash")
const User = require("../../data-access/models/User")

module.exports = {
  async login(req, res) {
    try {
      let user = await User.query()
        .where("username", "=", _.get(req, ["body", "username"]).toLowerCase())
        .andWhere("password", "=", _.get(req, ["body", "password"]).toLowerCase())
        .withGraphFetched("role")
        .first()
        .throwIfNotFound()
      return res.json(user)
    } catch (error) {
      return res.status(400).json({ messages: ["invalid login credentials"] })
    }
  }
}
