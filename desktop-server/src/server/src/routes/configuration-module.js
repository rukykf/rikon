const { Router } = require("express")
const UsersController = require("../modules/configuration/UsersController")
const RolesController = require("../modules/configuration/RolesController")
const DepartmentsController = require("../modules/configuration/DepartmentsController")
const SalesItemsController = require("../modules/configuration/SalesItemsController")
const RoomTypesController = require("../modules/configuration/RoomTypesController")
const RoomsController = require("../modules/configuration/RoomsController")

let router = Router()

router.get("/users", UsersController.index)
router.delete("/users/:id", UsersController.delete)
router.post("/users", UsersController.create)
router.post("/users/:id", UsersController.edit)
router.get("/users/:id", UsersController.show)

router.get("/roles", RolesController.index)
router.post("/roles", RolesController.create)
router.post("/roles/:id", RolesController.edit)
router.delete("/roles/:id", RolesController.delete)
router.get("/roles/:id", RolesController.show)
router.get("/permissions", RolesController.permissions)

router.get("/sales-items", SalesItemsController.index)
router.post("/sales-items", SalesItemsController.create)
router.get("/sales-items/:id", SalesItemsController.show)
router.delete("/sales-items/:id", SalesItemsController.delete)
router.post("/sales-items/:id", SalesItemsController.edit)

router.get("/departments", DepartmentsController.index)
router.post("/departments", DepartmentsController.create)
router.post("/departments/:id", DepartmentsController.edit)
router.get("/departments/:id", DepartmentsController.show)
router.delete("/departments/:id", DepartmentsController.delete)

router.get("/room-types", RoomTypesController.index)
router.post("/room-types", RoomTypesController.create)
router.get("/room-types/:id", RoomTypesController.show)
router.delete("/room-types/:id", RoomTypesController.delete)
router.post("/room-types/:id", RoomTypesController.edit)

router.get("/rooms", RoomsController.index)
router.post("/rooms", RoomsController.create)
router.get("/rooms/:id", RoomsController.show)
router.delete("/rooms/:id", RoomsController.delete)
router.post("/rooms/:id", RoomsController.edit)

module.exports = router
