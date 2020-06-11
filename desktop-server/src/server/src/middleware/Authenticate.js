module.exports = function(req, res, next) {
  if (req.get("username") == null || req.get("username") === "") {
    return res.status(401).json({ messages: ["unauthorized access"] })
  }
  return next()
}
