const db = require("../../../../src/data-access/db-config")
const ManagementListsTestDataFactory = require("./test-data/management-lists-test-data")
const DynamicManagementListsController = require("../../../../src/modules/configuration/DynamicManagementListsController")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

beforeEach(async () => {
  await ManagementListsTestDataFactory.deleteAllDataFromDB()
})

test("DynamicManagementListsController.index returns a list of all the people in the dynamic management list", async () => {
  let managementListData = await ManagementListsTestDataFactory.populateManagementListData()

  let output = null
  let req = {}
  let res = { json: jest.fn((args) => (output = args)) }

  await DynamicManagementListsController.index(req, res)
  expect(output.length).toEqual(16)
  expect(output[0]).toMatchObject(managementListData[0])
})

test("DynamicManagementListsController.index filters list of people by the list_name", async () => {
  let managementListData = await ManagementListsTestDataFactory.populateManagementListData()

  let output = null
  let req = { query: { list_name: "authorized_for_discounts" } }
  let res = { json: jest.fn((args) => (output = args)) }

  await DynamicManagementListsController.index(req, res)
  expect(output.length).toEqual(4)
  expect(output[0]).toMatchObject(managementListData[4])

  req.query.list_name = "some random name"
  await DynamicManagementListsController.index(req, res)
  expect(output.length).toEqual(0)
})

test("DynamicManagementListsController.create returns newly created item when passed valid data", async () => {
  let output = null
  let req = { body: { full_name: "some name", list_name: "authorized_to_authorize" } }
  let res = { json: jest.fn((args) => (output = args)) }

  await DynamicManagementListsController.create(req, res)
  expect(output).toMatchObject(req.body)
})

test("DynamicManagementListsController.create returns error message when passed invalid data", async () => {
  let output = null
  let req = { body: { full_name: "some name" } }
  let res = { status: jest.fn(), json: jest.fn((args) => (output = args)) }
  res.status.mockReturnThis()

  await DynamicManagementListsController.create(req, res)
  expect(output.messages.length).toEqual(1)

  req.body.list_name = "some random name"
  await DynamicManagementListsController.create(req, res)
  expect(output.messages.length).toEqual(1)

  // should give error when attempting to add the same name to the same list
  let item = await ManagementListsTestDataFactory.populateManagementListItemData(
    "authorized_to_authorize",
    "First Person"
  )
  req.body.list_name = "authorized_to_authorize"
  req.body.full_name = "First Person"
  await DynamicManagementListsController.create(req, res)
  expect(output.messages.length).toEqual(1)
  expect(res.json).toHaveBeenLastCalledWith({
    messages: ["you cannot add this person to the same list twice"]
  })
})

test("DynamicManagementListsController.edit returns updated item when passed valid data", async () => {
  let item = await ManagementListsTestDataFactory.populateManagementListItemData()

  let output = null
  let req = { params: { id: item.id }, body: { full_name: "another name" } }
  let res = { json: jest.fn((args) => (output = args)) }

  await DynamicManagementListsController.edit(req, res)
  expect(output.full_name).toEqual("another name")
  expect(output.id).toEqual(item.id)
})

test("DynamicManagementListsController.edit returns error message when passed invalid id", async () => {
  let output = null
  let req = { params: { id: 5 }, body: { full_name: "another name" } }
  let res = { status: jest.fn(), json: jest.fn((args) => (output = args)) }
  res.status.mockReturnThis()

  await DynamicManagementListsController.edit(req, res)
  expect(output.messages).toEqual(["the selected item was not found"])
})

test("DynamicManagementListsController.edit returns error message when passed invalid data", async () => {
  await ManagementListsTestDataFactory.populateManagementListItemData("authorized_to_authorize", "name already exists")
  let item = await ManagementListsTestDataFactory.populateManagementListItemData(
    "authorized_to_authorize",
    "person name"
  )

  let output = null
  let req = { params: { id: item.id }, body: { full_name: "name already exists" } }
  let res = { status: jest.fn(), json: jest.fn((args) => (output = args)) }
  res.status.mockReturnThis()

  await DynamicManagementListsController.edit(req, res)
  expect(output.messages).toEqual(["you cannot add this person to the same list twice"])
})

test("DynamicManagementListsController.delete returns success message when passed valid id", async () => {
  let item = await ManagementListsTestDataFactory.populateManagementListItemData()

  let output = null
  let req = { params: { id: item.id } }
  let res = { json: jest.fn((args) => (output = args)) }

  await DynamicManagementListsController.delete(req, res)
  expect(output.messages).toEqual(["successfully deleted selected item"])
})

test("DynamicManagementListsController.delete returns error message when passed invalid id", async () => {
  let output = null
  let req = { params: { id: 8 } }
  let res = { status: jest.fn(), json: jest.fn((args) => (output = args)) }
  res.status.mockReturnThis()

  await DynamicManagementListsController.delete(req, res)
  expect(output.messages).toEqual(["the selected item was not found"])
})

test("DynamicManagementListsController.show returns selected item when passed valid id", async () => {
  let item = await ManagementListsTestDataFactory.populateManagementListItemData()

  let output = null
  let req = { params: { id: item.id } }
  let res = { json: jest.fn((args) => (output = args)) }

  await DynamicManagementListsController.show(req, res)
  expect(output.full_name).toEqual("some name")
  expect(output.list_name).toEqual("authorized_to_authorize")
})

test("DynamicManagementListsController.show returns error message when passed invalid id", async () => {
  let output = null
  let req = { params: { id: 8 } }
  let res = { status: jest.fn(), json: jest.fn((args) => (output = args)) }
  res.status.mockReturnThis()

  await DynamicManagementListsController.show(req, res)
  expect(output.messages).toEqual(["could not find the selected item"])
})
