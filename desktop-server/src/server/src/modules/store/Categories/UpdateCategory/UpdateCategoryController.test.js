const db = require("../../../../data-access/db-config")
const Category = require("../../../../data-access/models/Category")
const UpdateCategoryController = require("./UpdateCategoryController")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

afterEach(async () => {
  await Category.query().delete()
})

test("UpdateCategoryController.execute successfully updates existing category", async () => {
  let category = await Category.query().insert({ name: "a category" })

  let output = null
  let req = { params: { id: category.id }, body: { name: "an updated category" } }
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await UpdateCategoryController.execute(req, res)
  expect(output.name).toEqual("an updated category")
  let updatedCategory = await Category.query().findById(category.id)
  expect(updatedCategory.name).toEqual("an updated category")
})

test("UpdateCategoryController.execute returns error message when attempting to update a category that doesn't exist", async () => {
  let output = null
  let req = { params: { id: 85 }, body: { name: "an updated category" } }
  let res = {
    json: jest.fn((args) => {
      output = args
    }),
    status: jest.fn()
  }
  res.status.mockReturnThis()

  await UpdateCategoryController.execute(req, res)
  expect(output.messages).toEqual(["could not find the selected category"])
  expect(res.status).toHaveBeenLastCalledWith(400)
})

test("UpdateCategoryController.execute returns error message when attempting to update category with duplicate name", async () => {
  let category = await Category.query().insert({ name: "a category" })
  let duplicateCategory = await Category.query().insert({ name: "an updated category" })

  let output = null
  let req = { params: { id: category.id }, body: { name: "an updated category" } }
  let res = {
    json: jest.fn((args) => {
      output = args
    }),
    status: jest.fn()
  }

  res.status.mockReturnThis()

  await UpdateCategoryController.execute(req, res)
  expect(output.messages).toEqual(["a category with this name already exists, select a different name"])
  expect(res.status).toHaveBeenLastCalledWith(400)
})
