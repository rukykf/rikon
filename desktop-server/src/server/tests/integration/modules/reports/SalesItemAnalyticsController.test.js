const { DateTime } = require("luxon")
const db = require("../../../../src/data-access/db-config")
const { populateOrderItemsData, deleteAllDataFromDB } = require("./test-data/sales-items-test-data")
const SalesItemAnalyticsController = require("../../../../src/modules/reports/SalesItemAnalyticsController")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

beforeEach(async () => {
  await deleteAllDataFromDB()
})

test("SalesItemAnalyticsCntroller.getQuantityBreakdownForSalesItems returns sales breakdown for the past 90 days by default", async () => {
  await populateOrderItemsData()

  let req = {}
  let output = null
  let res = {
    json: jest.fn((args) => (output = args))
  }

  await SalesItemAnalyticsController.getQuantityBreakdownForSalesItems(req, res)
  expect(output.length).toEqual(4)
  expect(output[0].name).toEqual("amala")
  expect(output[0].quantity).toEqual(4)
  expect(output[3].name).toEqual("malt")
  expect(output[3].quantity).toEqual(2)
})

test("SalesItemAnalyticsCntroller.getQuantityBreakdownForSalesItems returns accurate sales breakdown when filtered by date", async () => {
  await populateOrderItemsData()

  let req = {
    query: {
      start_date: DateTime.local()
        .minus({ days: 10 })
        .toISODate()
    }
  }
  let output = null
  let res = {
    json: jest.fn((args) => (output = args))
  }

  await SalesItemAnalyticsController.getQuantityBreakdownForSalesItems(req, res)
  expect(output.length).toEqual(4)
  expect(output[0].name).toEqual("amala")
  expect(output[0].quantity).toEqual(2)
  expect(output[2].name).toEqual("heineken")
  expect(output[2].quantity).toEqual(2)
})

test("SalesItemAnalyticsCntroller.getQuantityBreakdownForSalesItems returns accurate sales breakdown when filtered by department", async () => {
  let { departments } = await populateOrderItemsData()

  let req = {
    query: {
      department_id: departments[0].id
    }
  }
  let output = null
  let res = {
    json: jest.fn((args) => (output = args))
  }

  await SalesItemAnalyticsController.getQuantityBreakdownForSalesItems(req, res)

  expect(output.length).toEqual(2)
  expect(output[0].name).toEqual("amala")
  expect(output[0].quantity).toEqual(4)
  expect(output[1].name).toEqual("egusi")
  expect(output[1].quantity).toEqual(2)
})
