const db = require(".../../../../src/data-access/db-config")
const Department = require("../../../../src/data-access/models/Department")
const DepartmentsController = require("../../../../src/modules/configuration/DepartmentsController")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

beforeEach(async () => {
  await Department.query().delete()
})

afterAll(async () => {
  await Department.query().delete()
})

test("DepartmentsController.index returns list of available departments", async () => {
  let req = {}
  let res = { json: jest.fn() }
  let newDepartment = await Department.query().insert({ name: "new department" })
  await DepartmentsController.index(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([newDepartment]))
})

test("DepartmentsController.create returns newly created department when passed valid data", async () => {
  let req = {
    body: {
      name: "new department"
    }
  }
  let res = { json: jest.fn() }
  await DepartmentsController.create(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining(req.body))
})

test("DepartmentsController.create returns error message when passed invalid json schema", async () => {
  let req = {
    body: {
      name: null
    }
  }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await DepartmentsController.create(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: [expect.anything()] })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("DepartmentsController.create returns error message when passed duplicate department name", async () => {
  let newDepartment = await Department.query().insert({ name: "new department" })
  let req = {
    body: {
      name: "new department"
    }
  }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await DepartmentsController.create(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: ["this name is already assigned to another department"] })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("DepartmentsController.edit returns updated department when passed valid data", async () => {
  let department = await Department.query().insert({ name: "new department" })
  let req = { params: { id: department.id }, body: { name: "updated department" } }
  let res = { json: jest.fn() }

  await DepartmentsController.edit(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining(req.body))
})

test("DepartmentsController.edit returns error message when passed invalid id", async () => {
  let req = { params: { id: 89 }, body: { name: "updated department" } }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()

  await DepartmentsController.edit(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: ["the selected department was not found"] })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("DepartmentsController.edit returns error message when passed invalid json schema", async () => {
  let department = await Department.query().insert({ name: "new department" })
  let req = { params: { id: department.id }, body: { name: null } }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()

  await DepartmentsController.edit(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: [expect.anything()] })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("DepartmentsController.show returns selected department when passed valid id", async () => {
  let department = await Department.query().insert({ name: "new department" })
  let req = { params: { id: department.id } }
  let res = { json: jest.fn() }

  await DepartmentsController.show(req, res)
  expect(res.json).toHaveBeenCalledWith(department)
})

test("DepartmentsController.show returns error message when passed invalid id", async () => {
  let req = { params: { id: 89 } }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()

  await DepartmentsController.show(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: ["could not find selected department"] })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("DepartmentsController.delete returns success message whe passed valid id", async () => {
  let department = await Department.query().insert({ name: "new department" })
  let req = { params: { id: department.id } }
  let res = { json: jest.fn() }

  await DepartmentsController.delete(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "successfully deleted selected department" })
})

test("DepartmentsController.delete returns error message when passed invalid id", async () => {
  let req = { params: { id: 89 } }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()

  await DepartmentsController.delete(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: ["could not delete selected department"] })
  expect(res.status).toHaveBeenCalledWith(400)
})
