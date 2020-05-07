const { DateTime } = require("luxon")
const _ = require("lodash")
const Order = require("../../../data-access/models/Order")
const OrderItem = require("../../../data-access/models/OrderItem")
const SalesItem = require("../../../data-access/models/SalesItem")
const Department = require("../../../data-access/models/Department")
const Sale = require("../../../data-access/models/Sale")

module.exports = {
  getCancelledOrdersChartData: async function() {
    let cancelledOrdersChartData = []

    // start and end dates for the first month (which is the current month)
    let endDate = DateTime.local()
    let startDate = DateTime.local().startOf("month")

    for (let i = 0; i < 12; i++) {
      let numCancelledOrders = await Order.query()
        .where("created_at", ">=", startDate.toISODate())
        .andWhere("created_at", "<=", endDate.toISODate())
        .andWhere("status", "=", "cancelled")
        .resultSize()
      cancelledOrdersChartData.push({ month: startDate.monthShort, orders: numCancelledOrders })
      endDate = startDate
      startDate = startDate.minus({ month: 1 })
    }
    return cancelledOrdersChartData
  },

  getMonthlySalesChartData: async function() {
    let monthlySalesChartData = []

    // start and end dates for the first month (which is the current month)
    let endDate = DateTime.local()
    let startDate = DateTime.local().startOf("month")

    // process data for each of the last 12 months (plus the current one)
    for (let i = 0; i < 12; i++) {
      let sales = await Sale.query()
        .where("created_at", ">=", startDate.toISODate())
        .andWhere("created_at", "<=", endDate.toISODate())
        .sum("total_amount as sales")
      monthlySalesChartData.push({ month: startDate.monthShort, sales: sales[0].sales })
      endDate = startDate
      startDate = startDate.minus({ month: 1 })
    }
    return monthlySalesChartData
  },

  getOrderAndSalesAnalysisBySalesItem: async function(startDateISO, endDateISO) {
    // retrieve only the sales items with at least 1 order within the specified period

    let salesItems = await SalesItem.query()
      .withGraphJoined("order_items")
      .where("order_items.date", ">=", startDateISO)
      .andWhere("order_items.date", "<=", endDateISO)

    let salesItemsAnalyticsData = []
    for (let i = 0; i < salesItems.length; i++) {
      let salesItem = salesItems[i]
      let salesItemRow = {}

      // Get total quantity ordered
      let allOrderItemsForSalesItem = await OrderItem.query()
        .where("sales_item_id", "=", salesItem.id)
        .andWhere("date", ">=", startDateISO)
        .andWhere("date", "<=", endDateISO)

      let totalQuantityOrdered = 0
      allOrderItemsForSalesItem.forEach((orderItem) => {
        totalQuantityOrdered += orderItem.quantity
      })

      // Get total quantity and sales fulfilled (counted for fulfilled orders only)
      let fulfilledOrderItemsForSalesItem = await OrderItem.query()
        .withGraphJoined("order")
        .where("order_items.sales_item_id", "=", salesItem.id)
        .andWhere("order_items.date", ">=", startDateISO)
        .andWhere("order_items.date", "<=", endDateISO)
        .andWhere("order.status", "=", "fulfilled")

      let totalSales = 0
      let totalQuantitySold = 0
      fulfilledOrderItemsForSalesItem.forEach((orderItem) => {
        totalSales += orderItem.quantity * orderItem.price_per_unit
        totalQuantitySold += orderItem.quantity
      })

      // Get total quantity and sales cancelled (counted for cancelled orders only)
      let cancelledOrderItemsForSalesItem = await OrderItem.query()
        .withGraphJoined("order")
        .where("order_items.sales_item_id", "=", salesItem.id)
        .andWhere("order_items.date", ">=", startDateISO)
        .andWhere("order_items.date", "<=", endDateISO)
        .andWhere("order.status", "=", "cancelled")

      let totalLostSales = 0
      let totalQuantityOfLostSales = 0
      cancelledOrderItemsForSalesItem.forEach((orderItem) => {
        totalLostSales += orderItem.quantity * orderItem.price_per_unit
        totalQuantityOfLostSales += orderItem.quantity
      })

      salesItemRow = {
        name: salesItem.name,
        total_quantity_ordered: totalQuantityOrdered,
        total_sales: totalSales,
        total_quantity_sold: totalQuantitySold,
        total_lost_sales: totalLostSales,
        total_quantity_of_lost_sales: totalQuantityOfLostSales
      }
      salesItemsAnalyticsData.push(salesItemRow)
    }
    return salesItemsAnalyticsData
  },

  getOrderAndSalesAnalysisByDepartment: async function(startDateISO, endDateISO) {
    let orders = await Order.query()
      .andWhere("created_at", ">=", startDateISO)
      .andWhere("created_at", "<=", endDateISO)
      .withGraphFetched("sale")

    let departments = await Department.query()
    let departmentAnalytics = {}
    let departmentsMap = new Map()
    departments.forEach((department) => {
      let departmentAnalyticsData = {
        total_sales: 0,
        total_lost_sales: 0,
        total_orders: 0,
        total_cancelled_orders: 0,
        total_fulfilled_orders: 0,
        total_pending_orders: 0
      }
      departmentsMap.set(department.name, departmentAnalyticsData)
    })

    orders.forEach((order) => {
      order.departments.forEach((departmentName) => {
        // update the department's data
        let currentDepartmentAnalytics = departmentsMap.get(departmentName)

        if (order.status === "pending") {
          currentDepartmentAnalytics.total_pending_orders += 1
        }

        if (order.status === "fulfilled") {
          currentDepartmentAnalytics.total_fulfilled_orders += 1
          currentDepartmentAnalytics.total_sales += order.amount
        }

        if (order.status === "cancelled") {
          currentDepartmentAnalytics.total_cancelled_orders += 1
          currentDepartmentAnalytics.total_lost_sales += order.amount
        }

        departmentsMap.set(departmentName, currentDepartmentAnalytics)
      })
    })

    departmentsMap.forEach((analytics, departmentName) => {
      departmentAnalytics[departmentName] = analytics
    })
    return departmentAnalytics
  }
}
