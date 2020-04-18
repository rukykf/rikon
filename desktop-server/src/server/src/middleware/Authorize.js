const _ = require("lodash")
const RoutePermissions = require("../routes/route-permissions")
const User = require("../data-access/models/User")

module.exports = async function(req, res, next) {
  try {
    let username = req.get("username")
    if (username == null) {
      return res.status(401).json({ messages: ["unauthorized access"] })
    }

    let user = await User.query()
      .where("username", "=", username.toLowerCase())
      .withGraphFetched("role")
      .throwIfNotFound()
      .first()

    let requiredPermission = _.get(RoutePermissions, [req.route.path, req.method])
    if (user.role.permissions.includes(requiredPermission) || requiredPermission == null) {
      return next()
    }
    return res.status(401).json({ messages: ["unauthorized access"] })
  } catch (error) {
    return res.status(401).json({ messages: ["unauthorized access"] })
  }
}
