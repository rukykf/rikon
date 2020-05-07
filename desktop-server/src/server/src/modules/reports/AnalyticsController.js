const { DateTime } = require("luxon")
const _ = require("lodash")
const OrderAndSalesAnalyticsService = require("./services/OrderAndSalesAnalyticsService")
const Sale = require("../../data-access/models/Sale")
const Order = require("../../data-access/models/Order")
const SalesTransaction = require("../../data-access/models/SalesTransaction")
const Booking = require("../../data-access/models/Booking")

module.exports = {
  async getSalesAnalytics(req, res) {
    try {
      let startDateISO = _.hasIn(req, ["query", "start_date"]) ? req.query.start_date : DateTime.local().toISODate()
      let endDateISO = _.hasIn(req, ["query", "end_date"]) ? req.query.end_date : DateTime.local().toISODate()

      let salesAnalyticsData = {}

      salesAnalyticsData.total_sales = await Sale.query()
        .where("created_at", ">=", startDateISO)
        .andWhere("created_at", "<=", endDateISO)
        .sum("total_amount")

      salesAnalyticsData.total_credit = await Sale.query()
        .where("created_at", ">=", startDateISO)
        .andWhere("created_at", "<=", endDateISO)
        .sum("total_due")

      salesAnalyticsData.total_cash_sales = await SalesTransaction.query()
        .where("date", ">=", startDateISO)
        .andWhere("date", "<=", endDateISO)
        .andWhere("transaction_type", "=", "cash")
        .sum("amount")

      salesAnalyticsData.total_pos_sales = await SalesTransaction.query()
        .where("date", ">=", startDateISO)
        .andWhere("date", "<=", endDateISO)
        .andWhere("transaction_type", "=", "pos")
        .sum("amount")

      salesAnalyticsData.total_transfer_sales = await SalesTransaction.query()
        .where("date", ">=", startDateISO)
        .andWhere("date", "<=", endDateISO)
        .andWhere("transaction_type", "=", "transfer")
        .sum("amount")

      salesAnalyticsData.total_pending_orders = await Order.query()
        .where("created_at", ">=", startDateISO)
        .andWhere("created_at", "<=", endDateISO)
        .andWhere("status", "=", "pending")
        .resultSize()

      salesAnalyticsData.total_booking_sales = await Sale.query()
        .where("created_at", ">=", startDateISO)
        .andWhere("created_at", "<=", endDateISO)
        .andWhere("sellable_type", "=", "booking")
        .sum("total_amount")

      salesAnalyticsData.total_bookings = await Booking.query().where("created_at", ">=")

      salesAnalyticsData.total_order_sales = await Sale.query()
        .where("created_at", ">=", startDateISO)
        .andWhere("created_at", "<=", endDateISO)
        .andWhere("sellable_type", "=", "order")
        .sum("total_amount")

      salesAnalyticsData.total_cancelled_orders = await Order.query()
        .where("created_at", ">=", startDateISO)
        .andWhere("created_at", "<=", endDateISO)
        .andWhere("status", "=", "cancelled")
        .resultSize()

      salesAnalyticsData.total_discount = await SalesTransaction.query()
        .where("date", ">=", startDateISO)
        .andWhere("date", "<=", endDateISO)
        .andWhere("transaction_type", "=", "discount")
        .sum("amount")

      salesAnalyticsData.total_complementary = await SalesTransaction.query()
        .where("date", ">=", startDateISO)
        .andWhere("date", "<=", endDateISO)
        .andWhere("transaction_type", "=", "complementary")
        .sum("amount")

      salesAnalyticsData.cancelled_orders_by_month = await OrderAndSalesAnalyticsService.getCancelledOrdersChartData()
      salesAnalyticsData.sales_by_month = await OrderAndSalesAnalyticsService.getMonthlySalesChartData()
      salesAnalyticsData.analytics_by_department = await OrderAndSalesAnalyticsService.getOrderAndSalesAnalysisByDepartment(
        startDateISO,
        endDateISO
      )
      salesAnalyticsData.analytics_by_sales_item = await OrderAndSalesAnalyticsService.getOrderAndSalesAnalysisBySalesItem(
        startDateISO,
        endDateISO
      )
      return res.json(salesAnalyticsData)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  }
}
