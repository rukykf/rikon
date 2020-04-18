module.exports = function(req, res, next) {
  if (req.get("username") == null) {
    return res.status(401).json({ messages: ["unauthorized access"] })
  }
  return next()
}
