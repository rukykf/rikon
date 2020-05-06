const { Router } = require("express")
const UsersController = require("../modules/configuration/UsersController")

let router = Router()

router.get("/users", UsersController.index)

module.exports = router
