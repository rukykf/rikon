const { DateTime } = require("luxon")
const Order = require("../../../data-access/models/Order")
const OrderItem = require("../../../data-access/models/OrderItem")
const SalesItem = require("../../../data-access/models/SalesItem")

module.exports = {
  async getCancelledOrdersChartData() {},

  async getMonthlySalesChartData() {},

  async getOrderAndSalesAnalysisForSalesItems(startDateISO, endDateISO) {
    // retrieve only the sales items with at least 1 order within the specified period
    let salesItems = await SalesItem.query()
      .select(
        "*",
        SalesItem.relatedQuery("order_item")
          .where("date", ">=", startDateISO)
          .andWhere("date", "<=", endDateISO)
          .count()
          .as("num_of_orders")
      )
      .where("num_of_orders", ">=", 1)

    let salesItemsAnalyticsData = []
    for (let i = 0; i < salesItems.length; i++) {
      let salesItem = salesItems[i]
      let salesItemRow = {}
      salesItemRow.name = salesItem.name

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
        .andWhere("orders.status", "=", "fulfilled")

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
        .andWhere("orders.status", "=", "cancelled")

      let totalLostSales = 0
      let totalQuantityOfLostSales = 0
      cancelledOrderItemsForSalesItem.forEach((orderItem) => {
        totalLostSales += orderItem.quantity * orderItem.price_per_unit
        totalQuantityOfLostSales += orderItem.quantity
      })

      salesItemRow = {
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

  async getCancelledOrdersByDepartment(startDateISO, endDateISO) {
    let orders = await Order.query()
      .where("status", "=", "cancelled")
      .andWhere("created_at", ">=", startDateISO)
      .andWhere("created_at", "<=", endDateISO)
  }
}
