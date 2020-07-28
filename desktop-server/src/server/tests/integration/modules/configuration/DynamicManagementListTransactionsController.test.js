const { DateTime } = require("luxon")
const db = require("../../../../src/data-access/db-config")
const ManagementListTransactionTestDataFactory = require("./test-data/management-lists-transactions-test-data")
const DynamicManagementListTransactionsController = require("../../../../src/modules/configuration/DynamicManagementListTransactionsController")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

beforeEach(async () => {
  await ManagementListTransactionTestDataFactory.deleteAllDataFromDB()
})

test("DynamicManagementListTransactionsController.index returns list of all management list transactions", async () => {
  let {
    managementListTransactionItems
  } = await ManagementListTransactionTestDataFactory.populateManagementListTransactionsData()

  let output = null
  let req = {}
  let res = { json: jest.fn((args) => (output = args)) }

  await DynamicManagementListTransactionsController.index(req, res)
  expect(output.length).toEqual(12)
})

test("DynamicManagementListTransactionsController.index successfully filters transactions by management list item id", async () => {
  let { managementListItems } = await ManagementListTransactionTestDataFactory.populateManagementListTransactionsData()
  let authorizer = managementListItems[0]

  let output = null
  let req = { query: { management_list_item_id: authorizer.id } }
  let res = { json: jest.fn((args) => (output = args)) }

  await DynamicManagementListTransactionsController.index(req, res)
  expect(output.length).toEqual(3)
  expect(output[1].management_list_item_id).toEqual(authorizer.id)
})

test("DynamicManagementListTransactionsController.index filters transactions by sales status", async () => {
  await ManagementListTransactionTestDataFactory.populateManagementListTransactionsData()

  let output = null
  let req = { query: { sales_status: "owing" } }
  let res = { json: jest.fn((args) => (output = args)) }

  await DynamicManagementListTransactionsController.index(req, res)
  expect(output.length).toEqual(4)
})

test("DynamicManagementListTransactionsController.index filters transactions by list name", async () => {
  let { managementListItems } = await ManagementListTransactionTestDataFactory.populateManagementListTransactionsData()
  let discountPerson = managementListItems[1]

  let output = null
  let req = { query: { management_list_name: "authorized_for_discounts" } }
  let res = { json: jest.fn((args) => (output = args)) }

  await DynamicManagementListTransactionsController.index(req, res)
  expect(output.length).toEqual(3)
  expect(output[1].management_list_item_id).toEqual(discountPerson.id)
})

test("DynamicManagementListTransactionsController.index filters transactions by date", async () => {
  await ManagementListTransactionTestDataFactory.populateManagementListTransactionsData()

  let output = null
  let req = {
    query: {
      start_date: DateTime.local()
        .minus({ days: 110 })
        .toISODate(),
      end_date: DateTime.local()
        .minus({ days: 90 })
        .toISODate()
    }
  }
  let res = { json: jest.fn((args) => (output = args)) }

  await DynamicManagementListTransactionsController.index(req, res)
  expect(output.length).toEqual(4)
  expect(output[1].created_at).toEqual(
    DateTime.local()
      .minus({ days: 100 })
      .toISODate()
  )
})

test("DynamicManagementListTransactionsController.create returns new managementListTransaction when passed valid data", async () => {
  let { managementListItems } = await ManagementListTransactionTestDataFactory.populateManagementListTransactionsData()
  let discountPerson = managementListItems[1]
  let sale = await ManagementListTransactionTestDataFactory.populateSale()

  let output = null
  let req = { body: { management_list_item_id: discountPerson.id, sales_id: sale.id } }
  let res = { json: jest.fn((args) => (output = args)) }

  await DynamicManagementListTransactionsController.create(req, res)
  expect(output.sales_id).toEqual(sale.id)
  expect(output.management_list_item_id).toEqual(discountPerson.id)
})

test("DynamicManagementListTransactionsController.create returns error message when passed invalid sale id", async () => {
  let { managementListItems } = await ManagementListTransactionTestDataFactory.populateManagementListTransactionsData()
  let discountPerson = managementListItems[1]

  let output = null
  let req = { body: { management_list_item_id: discountPerson.id } }
  let res = { status: jest.fn(), json: jest.fn((args) => (output = args)) }
  res.status.mockReturnThis()

  await DynamicManagementListTransactionsController.create(req, res)
  expect(output.messages).toEqual(["please provide a sales id"])

  req.body.sales_id = 58
  await DynamicManagementListTransactionsController.create(req, res)
  expect(output.messages).toEqual(["please select a valid sales record"])
})

test("DynamicManagementListTransactionsController.create returns error message when passed invalid list item id", async () => {
  let sale = await ManagementListTransactionTestDataFactory.populateSale()

  let output = null
  let req = { body: { sales_id: sale.id } }
  let res = { status: jest.fn(), json: jest.fn((args) => (output = args)) }
  res.status.mockReturnThis()

  await DynamicManagementListTransactionsController.create(req, res)
  expect(output.messages).toEqual(["please select a valid name from the management approved list"])

  req.body.management_list_item_id = 29
  expect(output.messages).toEqual(["please select a valid name from the management approved list"])
})

test("DynamicManagementListTransactionsController.edit returns updated transaction when passed valid data", async () => {
  let transaction = await ManagementListTransactionTestDataFactory.populateManagementListTransactionItemData()
  let sale = await ManagementListTransactionTestDataFactory.populateSale()

  let output = null
  let req = { params: { id: transaction.id }, body: { sales_id: sale.id } }
  let res = { json: jest.fn((args) => (output = args)) }

  await DynamicManagementListTransactionsController.edit(req, res)
  expect(output.id).toEqual(transaction.id)
  expect(output.sales_id).toEqual(sale.id)
})

test("DynamicManagementListTransactionsController.edit returns error message when passed invalid sale id", async () => {
  let transaction = await ManagementListTransactionTestDataFactory.populateManagementListTransactionItemData()

  let output = null
  let req = { params: { id: transaction.id }, body: { sales_id: 100 } }
  let res = { status: jest.fn(), json: jest.fn((args) => (output = args)) }
  res.status.mockReturnThis()

  await DynamicManagementListTransactionsController.edit(req, res)
  expect(output.messages).toEqual(["please select a valid sales record"])
})

test("DynamicManagementListTransactionsController.show returns the selected transaction when passed valid id", async () => {
  let transaction = await ManagementListTransactionTestDataFactory.populateManagementListTransactionItemData()

  let output = null
  let req = { params: { id: transaction.id } }
  let res = { json: jest.fn((args) => (output = args)) }

  await DynamicManagementListTransactionsController.show(req, res)
  expect(output.id).toEqual(transaction.id)
})

test("DynamicManagementListTransactionsController.show returns error message when passed invalid id", async () => {
  let output = null
  let req = { params: { id: 59 } }
  let res = { status: jest.fn(), json: jest.fn((args) => (output = args)) }
  res.status.mockReturnThis()

  await DynamicManagementListTransactionsController.show(req, res)
  expect(output.messages).toEqual(["the selected transaction was not found"])
})

test("DynamicManagementListTransactionsController.delete returns success message when passed valid id", async () => {
  let transaction = await ManagementListTransactionTestDataFactory.populateManagementListTransactionItemData()

  let output = null
  let req = { params: { id: transaction.id } }
  let res = { json: jest.fn((args) => (output = args)) }

  await DynamicManagementListTransactionsController.delete(req, res)
  expect(output.messages).toEqual(["successfully deleted the selected transaction"])
})

test("DynamicManagementListTransactionsController.delete returns error message when passed invalid id", async () => {
  let output = null
  let req = { params: { id: 59 } }
  let res = { status: jest.fn(), json: jest.fn((args) => (output = args)) }
  res.status.mockReturnThis()

  await DynamicManagementListTransactionsController.delete(req, res)
  expect(output.messages).toEqual(["the selected transaction was not found"])
})
