const { Router } = require("express")
const UsersController = require("../controllers/UsersController")

let router = Router()

router.get("/users", UsersController.index)

module.exports = router
