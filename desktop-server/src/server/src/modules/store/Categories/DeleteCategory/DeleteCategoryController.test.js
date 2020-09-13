const db = require("../../../../data-access/db-config")
const Category = require("../../../../data-access/models/Category")
const DeleteCategoryController = require("./DeleteCategoryController")
const { populateCategoryWithStoreItems } = require("../TestData/categories.test-data")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

afterEach(async () => {
  await Category.query().delete()
})

test("DeleteCategoryController.execute successfully deletes existing categories", async () => {
  let category = await Category.query().insert({ name: "category" })
  let output = null
  let req = { params: { id: category.id } }
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await DeleteCategoryController.execute(req, res)
  expect(output.messages).toEqual(["successfully deleted selected category"])
})

test("DeleteCategoryController.execute returns error message when attempting to delete a category with store items under it", async () => {
  let { categories } = await populateCategoryWithStoreItems()
  let categoryWithStoreItems = categories[0]

  let output = null
  let req = { params: { id: categoryWithStoreItems.id } }
  let res = {
    status: jest.fn(),
    json: jest.fn((args) => {
      output = args
    })
  }

  res.status.mockReturnThis()

  await DeleteCategoryController.execute(req, res)
  expect(output.messages).toEqual([
    "there are store items in this category, reassign those items to another category and then try deleting this category again"
  ])
  expect(res.status).toHaveBeenCalledWith(400)
})

test("DeleteCategoryController.execute returns error message when attempting to delete a category that doesn't exist", async () => {
  let output = null
  let req = { params: { id: 53 } }
  let res = {
    status: jest.fn(),
    json: jest.fn((args) => {
      output = args
    })
  }

  res.status.mockReturnThis()

  await DeleteCategoryController.execute(req, res)
  expect(output.messages).toEqual(["could not find the selected category"])
  expect(res.status).toHaveBeenCalledWith(400)
})
