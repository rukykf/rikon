const db = require("../../../../data-access/db-config")
const Category = require("../../../../data-access/models/Category")
const CreateCategoryController = require("./CreateCategoryController")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

afterEach(async () => {
  await Category.query().delete()
})

test("CreateCategoryController.execute successfully creates new categories", async () => {
  let req = {
    body: { name: "electronics" }
  }
  let output = null
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await CreateCategoryController.execute(req, res)
  expect(output.name).toEqual("electronics")
  let categories = await Category.query()
  expect(categories.length).toEqual(1)
})

test("CreateCategoryController.execute returns error message with duplicate names", async () => {
  await Category.query().insert({ name: "electronics" })
  let req = {
    body: { name: "electronics" }
  }
  let output = null
  let res = {
    status: jest.fn(),
    json: jest.fn((args) => {
      output = args
    })
  }
  res.status.mockReturnThis()

  await CreateCategoryController.execute(req, res)
  expect(output.messages).toEqual(["a category with this name already exists, select a different name"])
  expect(res.status).toHaveBeenCalledWith(400)
})

test("CreateCategoryController.execute returns error message with invalid request data", async () => {
  let req = {}
  let output = null
  let res = {
    status: jest.fn(),
    json: jest.fn((args) => {
      output = args
    })
  }
  res.status.mockReturnThis()

  await CreateCategoryController.execute(req, res)
  expect(output.messages).toEqual(["the name of the category is required"])
  expect(res.status).toHaveBeenCalledWith(400)
})
