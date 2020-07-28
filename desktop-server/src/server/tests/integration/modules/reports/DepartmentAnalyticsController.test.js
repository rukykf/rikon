const { DateTime } = require("luxon")
const db = require("../../../../src/data-access/db-config")
const { populateDepartmentsBookingsAndOrders } = require("./test-data/test-data-utils")
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

test("DepartmentAnalyticsController.getDepartmentSalesBreakdown returns accurate report of sales breakdown for fulfilled orders", async () => {
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
  await DepartmentAnalyticsController.getDepartmentSalesBreakdown(req, res)
  expect(response.totalCashSales).toEqual(8000)
  expect(response.totalTransferSales).toEqual(6000)
  expect(response.totalPOSSales).toEqual(10000)

  req.query.department = "BAR"
  await DepartmentAnalyticsController.getDepartmentSalesBreakdown(req, res)
  expect(response.totalCashSales).toEqual(4000)
  expect(response.totalTransferSales).toEqual(3000)
  expect(response.totalPOSSales).toEqual(5000)

  req.query.department = "kitchen"
  await DepartmentAnalyticsController.getDepartmentSalesBreakdown(req, res)
  expect(response.totalCashSales).toEqual(4000)
  expect(response.totalTransferSales).toEqual(3000)
  expect(response.totalPOSSales).toEqual(5000)
})
