const db = require(".../../../../src/data-access/db-config")
const SalesController = require("../../../../src/controllers/sales/SalesController")
const Sale = require("../../../../src/data-access/models/Sale")
const SalesTransaction = require("../../../../src/data-access/models/SalesTransaction")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

beforeEach(async () => {
  await Sale.query().delete()
  await SalesTransaction.query().delete()
})

afterAll(async () => {
  await Sale.query().delete()
  await SalesTransaction.query().delete()
})

test("SalesController.index returns list of active sales in the past 90 days by default", async () => {})

test("SalesController.index successfully filters list of sales by date", async () => {})

test("SalesController.index successfully filters list of sales by status", async () => {})

test("SalesController.getCreditSales successfully returns list of credit sales", async () => {})

test("SalesController.mergeSalesRecords returns new merged sale when passed valid sales IDs", async () => {})

test("SalesController.mergeSalesRecords returns error message when passed invalid sales ID", async () => {})

test("SalesController.updateSalesRecordWithTransaciton succeeds with cash transaction", async () => {})

test("SalesController.updateSalesRecordWithTransaction succeeds with discount transaction", async () => {})

test("SalesController.updateDalesRecordWithTransaction succeeds with complementary transaction", async () => {})

test("SalesController.updateSalesRecordWithTransaction returns error messages when passed invalid request data", async () => {})

test("SalesController.updateSalesRecordWithTransaction returns error messages when passed invalid sellable_id", async () => {})
