const { DateTime } = require("luxon")
const db = require("../../../../src/data-access/db-config")
const {
  populateDepartmentsBookingsAndOrders,
  populateSalesAndSalesTransactionsWithDepartmentAndTransactionType
} = require("./test-data/test-data-utils")
const Sale = require("../../../../src/data-access/models/Sale")
const Order = require("../../../../src/data-access/models/Order")
const SalesTransaction = require("../../../../src/data-access/models/SalesTransaction")
const Booking = require("../../../../src/data-access/models/Booking")
const DepartmentAnalyticsController = require("../../../../src/modules/reports/DepartmentAnalyticsController")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

beforeEach(async () => {
  await Sale.query().delete()
  await Order.query().delete()
  await SalesTransaction.query().delete()
  await Booking.query().delete()
})

test("DepartmentAnalyticsController.getDepartmentSalesBreakdownFromSalesTable returns accurate report of sales breakdown by department", async () => {
  await populateSalesAndSalesTransactionsWithDepartmentAndTransactionType()

  let req = {}
  let output = null
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await DepartmentAnalyticsController.getDepartmentSalesBreakdownFromSalesTable(req, res)
  expect(output.totalCashSales).toEqual(16000)
  expect(output.totalPOSSales).toEqual(16000)
  expect(output.totalTransferSales).toEqual(16000)
  expect(output.totalDebt).toEqual(10000)
  expect(output.totalDiscount).toEqual(12000)
  expect(output.totalCompany).toEqual(10000)
  expect(output.totalComplementary).toEqual(10000)
  expect(output.totalSales).toEqual(90000)
})

test("DepartmentAnalyticsController.getDepartmentSalesBreakdownFromSalesTable successfully filters reports by date", async () => {
  await populateSalesAndSalesTransactionsWithDepartmentAndTransactionType()

  let req = {
    query: {
      start_date: DateTime.local()
        .minus({ days: 15 })
        .toISODate()
    }
  }
  let output = null
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await DepartmentAnalyticsController.getDepartmentSalesBreakdownFromSalesTable(req, res)
  expect(output.totalCashSales).toEqual(32000)
  expect(output.totalPOSSales).toEqual(32000)
  expect(output.totalTransferSales).toEqual(32000)
  expect(output.totalDebt).toEqual(20000)
  expect(output.totalDiscount).toEqual(24000)
  expect(output.totalCompany).toEqual(20000)
  expect(output.totalComplementary).toEqual(20000)
  expect(output.totalSales).toEqual(180000)
})

test("DepartmentAnalyticsController.getDepartmentSalesBreakdownFromSalesTable successfully filters reports by department", async () => {
  await populateSalesAndSalesTransactionsWithDepartmentAndTransactionType()

  let req = {
    query: {
      start_date: DateTime.local()
        .minus({ days: 15 })
        .toISODate(),
      department_id: 1
    }
  }
  let output = null
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await DepartmentAnalyticsController.getDepartmentSalesBreakdownFromSalesTable(req, res)
  expect(output.totalCashSales).toEqual(16000)
  expect(output.totalPOSSales).toEqual(16000)
  expect(output.totalTransferSales).toEqual(16000)
  expect(output.totalDebt).toEqual(10000)
  expect(output.totalDiscount).toEqual(12000)
  expect(output.totalCompany).toEqual(10000)
  expect(output.totalComplementary).toEqual(10000)
  expect(output.totalSales).toEqual(90000)
})

test("DepartmentAnalyticsController.getBookingsSalesBreakdown returns accurate report of sales breakdown from hotel bookings", async () => {
  await populateDepartmentsBookingsAndOrders()

  let req = {
    query: {
      start_date: DateTime.local()
        .minus({ days: 1 })
        .toISODate(),
      end_date: DateTime.local()
        .plus({ days: 1 })
        .toISODate()
    }
  }
  let response = null
  let res = {
    status: jest.fn(),
    json: jest.fn((bookingSalesBreakdown) => {
      response = bookingSalesBreakdown
    })
  }
  res.status.mockReturnThis()

  await DepartmentAnalyticsController.getBookingsSalesBreakdown(req, res)
  expect(response.totalCashSales).toEqual(4000)
  expect(response.totalTransferSales).toEqual(3000)
  expect(response.totalPOSSales).toEqual(5000)
})

test("DepartmentAnalyticsController.getDepartmentSalesBreakdownFromOrdersTable returns accurate report of sales breakdown for fulfilled orders", async () => {
  await populateDepartmentsBookingsAndOrders()

  let req = {
    query: {
      start_date: DateTime.local()
        .minus({ days: 1 })
        .toISODate(),
      end_date: DateTime.local()
        .plus({ days: 1 })
        .toISODate()
    }
  }
  let response = null
  let res = {
    status: jest.fn(),
    json: jest.fn((bookingSalesBreakdown) => {
      response = bookingSalesBreakdown
    })
  }
  res.status.mockReturnThis()
  await DepartmentAnalyticsController.getDepartmentSalesBreakdownFromOrdersTable(req, res)
  expect(response.totalCashSales).toEqual(8000)
  expect(response.totalTransferSales).toEqual(6000)
  expect(response.totalPOSSales).toEqual(10000)

  req.query.department_name = "BAR"
  await DepartmentAnalyticsController.getDepartmentSalesBreakdownFromOrdersTable(req, res)
  expect(response.totalCashSales).toEqual(4000)
  expect(response.totalTransferSales).toEqual(3000)
  expect(response.totalPOSSales).toEqual(5000)

  req.query.department_name = "kitchen"
  await DepartmentAnalyticsController.getDepartmentSalesBreakdownFromOrdersTable(req, res)
  expect(response.totalCashSales).toEqual(4000)
  expect(response.totalTransferSales).toEqual(3000)
  expect(response.totalPOSSales).toEqual(5000)
})
