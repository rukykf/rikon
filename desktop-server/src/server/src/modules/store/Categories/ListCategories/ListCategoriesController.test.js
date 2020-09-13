const db = require("../../../../data-access/db-config")
const Category = require("../../../../data-access/models/Category")
const { populateActiveAndInactiveCategory } = require("../TestData/categories.test-data")
const ListCategoriesController = require("./ListCategoriesController")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

afterEach(async () => {
  await Category.query().delete()
})

test("ListCategoriesController.execute successfully returns a list of all active categories", async () => {
  let { categories } = await populateActiveAndInactiveCategory()
  let output = null
  let req = {}
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await ListCategoriesController.execute(req, res)
  expect(output.length).toEqual(1)
  expect(output[0].name).toEqual("an active category")
})

test("ListCategoriesController.execute filters list by active", async () => {
  let { categories } = await populateActiveAndInactiveCategory()
  let output = null
  let req = { query: { active: 0 } }
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await ListCategoriesController.execute(req, res)
  expect(output.length).toEqual(1)
  expect(output[0].name).toEqual("an inactive category")

  req.query.active = 1
  await ListCategoriesController.execute(req, res)
  expect(output.length).toEqual(1)
  expect(output[0].name).toEqual("an active category")
})
