const db = require(".../../../../src/data-access/db-config")
const SalesItem = require("../../../../src/data-access/models/SalesItem")
const Department = require("../../../../src/data-access/models/Department")
const SalesItemsController = require("../../../../src/modules/configuration/SalesItemsController")

let newDepartment = null

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
  newDepartment = await Department.query().insert({ name: "a department" })
})
beforeEach(async () => {
  await SalesItem.query().delete()
})

afterAll(async () => {
  await SalesItem.query().delete()
  await Department.query().delete()
})

test("SalesItemsController.index returns list of available sales items", async () => {
  let req = {}
  let res = { json: jest.fn() }
  let newSalesItem = await SalesItem.query().insert({
    name: "some item",
    unit: "unity",
    price_per_unit: 400,
    department_id: newDepartment.id
  })
  await SalesItemsController.index(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining(newSalesItem)]))
})

test("SalesItemsController.create returns newly created sales item when passed valid data", async () => {
  let req = {
    body: {
      name: "some item",
      unit: "unity",
      price_per_unit: 400,
      department_id: newDepartment.id
    }
  }
  let res = { json: jest.fn() }
  await SalesItemsController.create(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining(req.body))
})

test("SalesItemsController.create returns error message when passed duplicate sales item name", async () => {
  let newSalesItem = await SalesItem.query().insert({
    name: "some item",
    unit: "unity",
    price_per_unit: 400,
    department_id: newDepartment.id
  })

  let req = {
    body: {
      name: "some item",
      unit: "unity",
      price_per_unit: 400,
      department_id: newDepartment.id
    }
  }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await SalesItemsController.create(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: ["a sales item with this name already exists"] })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("SalesItemsController.create returns error message when passed invalid json schema", async () => {
  let req = {
    body: {
      unit: "unity",
      price_per_unit: 400,
      department_id: newDepartment.id
    }
  }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await SalesItemsController.create(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: [expect.anything()] })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("SalesItemsController.edit returns updated sales item when passed valid data", async () => {
  let salesItem = await SalesItem.query().insert({
    name: "some item",
    unit: "unity",
    price_per_unit: 400,
    department_id: newDepartment.id
  })
  let req = { params: { id: salesItem.id }, body: { name: "updated item" } }
  let res = { json: jest.fn() }
  await SalesItemsController.edit(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining(req.body))
})

test("SalesItemsController.edit returns error message when passed invalid id", async () => {
  let req = { params: { id: 58 }, body: { name: "updated item" } }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await SalesItemsController.edit(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: ["the selected sales item was not found"] })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("SalesItemsController.edit returns error message when passed invalid json schema", async () => {
  let salesItem = await SalesItem.query().insert({
    name: "some item",
    unit: "unity",
    price_per_unit: 400,
    department_id: newDepartment.id
  })
  let req = { params: { id: salesItem.id }, body: { name: null } }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await SalesItemsController.edit(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: [expect.anything()] })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("SalesItemsController.show returns selected sales item when passed valid id", async () => {
  let salesItem = await SalesItem.query().insert({
    name: "some item",
    unit: "unity",
    price_per_unit: 400,
    department_id: newDepartment.id
  })
  let req = { params: { id: salesItem.id } }
  let res = { json: jest.fn() }
  await SalesItemsController.show(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining(salesItem))
})

test("SalesItemsController.show returns error message when passed invalid id", async () => {
  let req = { params: { id: 58 } }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await SalesItemsController.show(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: ["the selected sales item was not found"] })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("SalesItemsController.delete returns success message when passed valid id", async () => {
  let salesItem = await SalesItem.query().insert({
    name: "some item",
    unit: "unity",
    price_per_unit: 400,
    department_id: newDepartment.id
  })
  let req = { params: { id: salesItem.id } }
  let res = { json: jest.fn() }
  await SalesItemsController.delete(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: ["successfully deleted the selected sales item"] })
})

test("SalesItemsController.delete returns error messaged when passed invalid id", async () => {
  let req = { params: { id: 58 } }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await SalesItemsController.delete(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: ["could not delete selected sales item"] })
  expect(res.status).toHaveBeenCalledWith(400)
})
