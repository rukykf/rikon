const { DateTime } = require("luxon")
const db = require(".../../../../src/data-access/db-config")
const {
  populateMonthlySales,
  populateMonthlyOrders,
  populateSalesItemsAndOrders,
  populateDepartmentAndOrders
} = require("../test-data/test-data-utils")
const Order = require("../../../../../src/data-access/models/Order")
const SalesItem = require("../../../../../src/data-access/models/SalesItem")
const Sale = require("../../../../../src/data-access/models/Sale")
const Department = require("../../../../../src/data-access/models/Department")
const OrderAndSalesAnalyticsService = require("../../../../../src/modules/reports/services/OrderAndSalesAnalyticsService")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

beforeEach(async () => {
  await Sale.query().delete()
  await Order.query().delete()
  await SalesItem.query().delete()
  await Department.query().delete()
})

test("OrderAndAnalyticsService.getCancelledOrdersChartData returns aggregate of cancelled orders each month for last 12 months", async () => {
  await populateMonthlyOrders()
  let currentMonth = DateTime.local().monthShort
  let lastMonth = DateTime.local().minus({ months: 1 }).monthShort
  let ordersChartData = await OrderAndSalesAnalyticsService.getCancelledOrdersChartData()

  expect(ordersChartData.length).toEqual(12)
  ordersChartData.forEach((el) => {
    expect(el.orders).toEqual(2)
  })
  expect(ordersChartData[0].month).toEqual(currentMonth)
  expect(ordersChartData[1].month).toEqual(lastMonth)
})

test("OrderAndAnalyticsService.getMonthlySalesChartData returns aggregate of sales each month for last 12 months", async () => {
  await populateMonthlySales()
  let currentMonth = DateTime.local().monthShort
  let lastMonth = DateTime.local().minus({ months: 1 }).monthShort
  let salesChartData = await OrderAndSalesAnalyticsService.getMonthlySalesChartData()

  expect(salesChartData.length).toEqual(12)
  salesChartData.forEach((el) => {
    expect(el.sales).toEqual(10000)
  })
  expect(salesChartData[0].month).toEqual(currentMonth)
  expect(salesChartData[1].month).toEqual(lastMonth)
})

test("OrderAndAnalyticsService.getOrderAndSalesAnalysisBySalesItem returns analytics for each sales item", async () => {
  let salesItems = await populateSalesItemsAndOrders()
  let startDateISO = DateTime.local().toISODate()
  let endDateISO = DateTime.local().toISODate()

  let salesItemsAnalyticsData = await OrderAndSalesAnalyticsService.getOrderAndSalesAnalysisBySalesItem(
    startDateISO,
    endDateISO
  )

  expect(salesItemsAnalyticsData.length).toEqual(2)
  expect(salesItemsAnalyticsData[0].name).toEqual(salesItems[0].name)
  expect(salesItemsAnalyticsData[0].total_quantity_ordered).toEqual(15)
  expect(salesItemsAnalyticsData[0].total_sales).toEqual(20000)
  expect(salesItemsAnalyticsData[0].total_lost_sales).toEqual(10000)
  expect(salesItemsAnalyticsData[0].total_quantity_of_lost_sales).toEqual(5)
  expect(salesItemsAnalyticsData[0].total_quantity_sold).toEqual(10)
  expect(salesItemsAnalyticsData[1].name).toEqual(salesItems[1].name)
  expect(salesItemsAnalyticsData[1].total_quantity_ordered).toEqual(10)
  expect(salesItemsAnalyticsData[1].total_sales).toEqual(10000)
  expect(salesItemsAnalyticsData[1].total_lost_sales).toEqual(10000)
  expect(salesItemsAnalyticsData[1].total_quantity_of_lost_sales).toEqual(5)
  expect(salesItemsAnalyticsData[1].total_quantity_sold).toEqual(5)
})

test("OrderAndAnalyticsService.getOrderAndSalesAnalysisBySalesItem filters by date", async () => {
  let salesItems = await populateSalesItemsAndOrders()
  let startDateISO = DateTime.local()
    .minus({ days: 5 })
    .toISODate()
  let endDateISO = DateTime.local()
    .minus({ days: 2 })
    .toISODate()

  let salesItemsAnalyticsData = await OrderAndSalesAnalyticsService.getOrderAndSalesAnalysisBySalesItem(
    startDateISO,
    endDateISO
  )

  expect(salesItemsAnalyticsData.length).toEqual(2)
  expect(salesItemsAnalyticsData[0].name).toEqual(salesItems[0].name)
  expect(salesItemsAnalyticsData[0].total_quantity_ordered).toEqual(15)
  expect(salesItemsAnalyticsData[0].total_sales).toEqual(20000)
  expect(salesItemsAnalyticsData[0].total_lost_sales).toEqual(10000)
  expect(salesItemsAnalyticsData[0].total_quantity_of_lost_sales).toEqual(5)
  expect(salesItemsAnalyticsData[0].total_quantity_sold).toEqual(10)
  expect(salesItemsAnalyticsData[1].name).toEqual(salesItems[1].name)
  expect(salesItemsAnalyticsData[1].total_quantity_ordered).toEqual(10)
  expect(salesItemsAnalyticsData[1].total_sales).toEqual(10000)
  expect(salesItemsAnalyticsData[1].total_lost_sales).toEqual(10000)
  expect(salesItemsAnalyticsData[1].total_quantity_of_lost_sales).toEqual(5)
  expect(salesItemsAnalyticsData[1].total_quantity_sold).toEqual(5)
})

test("OrderAndAnalyticsService.getOrderAndSalesAnalysisByDepartment returns analytics by department", async () => {
  let departments = await populateDepartmentAndOrders()
  let startDate = DateTime.local().toISODate()
  let endDate = DateTime.local().toISODate()

  let departmentAnalytics = await OrderAndSalesAnalyticsService.getOrderAndSalesAnalysisByDepartment(startDate, endDate)
  expect(departmentAnalytics[departments[0].name].total_pending_orders).toEqual(1)
  expect(departmentAnalytics[departments[0].name].total_cancelled_orders).toEqual(3)
  expect(departmentAnalytics[departments[0].name].total_fulfilled_orders).toEqual(3)
  expect(departmentAnalytics[departments[0].name].total_sales).toEqual(30000)
  expect(departmentAnalytics[departments[0].name].total_lost_sales).toEqual(30000)

  expect(departmentAnalytics[departments[1].name].total_pending_orders).toEqual(0)
  expect(departmentAnalytics[departments[1].name].total_cancelled_orders).toEqual(3)
  expect(departmentAnalytics[departments[1].name].total_fulfilled_orders).toEqual(3)
  expect(departmentAnalytics[departments[1].name].total_sales).toEqual(30000)
  expect(departmentAnalytics[departments[1].name].total_lost_sales).toEqual(30000)
})

test("OrderAndAnalyticsService.getOrderAndSalesAnalysisByDepartment filters by date", async () => {
  let departments = await populateDepartmentAndOrders()
  let startDate = DateTime.local()
    .minus({ days: 12 })
    .toISODate()
  let endDate = DateTime.local().toISODate()
  let departmentAnalytics = await OrderAndSalesAnalyticsService.getOrderAndSalesAnalysisByDepartment(startDate, endDate)

  expect(departmentAnalytics[departments[0].name].total_pending_orders).toEqual(1)
  expect(departmentAnalytics[departments[0].name].total_cancelled_orders).toEqual(5)
  expect(departmentAnalytics[departments[0].name].total_fulfilled_orders).toEqual(4)

  expect(departmentAnalytics[departments[1].name].total_pending_orders).toEqual(0)
  expect(departmentAnalytics[departments[1].name].total_cancelled_orders).toEqual(5)
  expect(departmentAnalytics[departments[1].name].total_fulfilled_orders).toEqual(4)
})
