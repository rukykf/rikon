const { DateTime } = require("luxon")
const db = require("../../../../src/data-access/db-config")
const OrderItemsTestDataFactory = require("./test-data/order-items-test-data")
const OrderItemsController = require("../../../../src/modules/sales/OrderItemsController")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

beforeEach(async () => {
  await OrderItemsTestDataFactory.deleteAllDataFromDB()
})

test("OrderItemsController.index returns list of OrderItems created in past 90 days by default", async () => {
  let { orderItems } = await OrderItemsTestDataFactory.populateOrderItemsData()

  let output = null
  let req = {}
  let res = {
    json: jest.fn((args) => (output = args))
  }

  await OrderItemsController.index(req, res)
  expect(output.length).toEqual(16)
  expect(output[1]).toMatchObject(orderItems[1])
})

test("OrderItemsController.index returns filters list of OrderItems by status", async () => {
  let { orderItems } = await OrderItemsTestDataFactory.populateOrderItemsData()

  let output = null
  let req = { query: { status: "fulfilled" } }
  let res = {
    json: jest.fn((args) => (output = args))
  }

  await OrderItemsController.index(req, res)
  expect(output.length).toEqual(8)
  expect(output[1]).toMatchObject(orderItems[1])
})

test("OrderItemsController.index returns filters list of OrderItems by department_id", async () => {
  let { orderItems, departments } = await OrderItemsTestDataFactory.populateOrderItemsData()

  let output = null
  let req = { query: { status: "fulfilled", department_id: departments[0].id } }
  let res = {
    json: jest.fn((args) => (output = args))
  }

  await OrderItemsController.index(req, res)
  expect(output.length).toEqual(4)
  expect(output[1]).toMatchObject(orderItems[1])
})

test("OrderItemsController.index returns filters list of OrderItems by date", async () => {
  await OrderItemsTestDataFactory.populateOrderItemsData()

  let output = null
  let req = {
    query: {
      start_date: DateTime.local()
        .minus({ days: 200 })
        .toISODate(),
      end_date: DateTime.local()
        .minus({ days: 90 })
        .toISODate(),
      status: "pending"
    }
  }
  let res = {
    json: jest.fn((args) => (output = args))
  }

  await OrderItemsController.index(req, res)
  expect(output.length).toEqual(4)
  expect(output[0].name).toEqual("amala")
})
