const { DateTime } = require("luxon")
const _ = require("lodash")
const OrderAndSalesAnalyticsService = require("./services/OrderAndSalesAnalyticsService")
const Sale = require("../../data-access/models/Sale")
const Order = require("../../data-access/models/Order")
const SalesTransaction = require("../../data-access/models/SalesTransaction")
const Booking = require("../../data-access/models/Booking")

module.exports = {
  /**
   * Some other interesting data points for later include
   * RoomTypes sales (ordered from highest to lowest sales)
   *
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  async getSalesAnalytics(req, res) {
    try {
      let startDateISO = _.hasIn(req, ["query", "start_date"]) ? req.query.start_date : DateTime.local().toISODate()
      let endDateISO = _.hasIn(req, ["query", "end_date"]) ? req.query.end_date : DateTime.local().toISODate()

      let salesAnalyticsData = { statCards: [] }

      salesAnalyticsData.statCards.push({
        mainTitle: "separator",
        value: "Sales & Credit"
      })

      salesAnalyticsData.total_sales = await Sale.query()
        .where("created_at", ">=", startDateISO)
        .andWhere("created_at", "<=", endDateISO)
        .andWhere("active", "=", 1)
        .sum("total_amount as sales")
      salesAnalyticsData.statCards.push({
        mainTitle: "Total Sales",
        isMoney: true,
        value: salesAnalyticsData.total_sales[0].sales
      })

      salesAnalyticsData.total_credit = await Sale.query()
        .where("created_at", ">=", startDateISO)
        .andWhere("created_at", "<=", endDateISO)
        .andWhere("active", "=", 1)
        .sum("total_due as credit")
      salesAnalyticsData.statCards.push({
        mainTitle: "Total Credit Sales (Debt)",
        isMoney: true,
        value: salesAnalyticsData.total_credit[0].credit
      })

      salesAnalyticsData.statCards.push({
        mainTitle: "separator",
        value: "Payment Breakdown"
      })

      salesAnalyticsData.total_cash_sales = await SalesTransaction.query()
        .where("date", ">=", startDateISO)
        .andWhere("date", "<=", endDateISO)
        .andWhere("transaction_type", "=", "cash")
        .andWhere("active", "=", 1)
        .sum("amount as amount")
      salesAnalyticsData.statCards.push({
        mainTitle: "Total Cash Sales",
        isMoney: true,
        value: salesAnalyticsData.total_cash_sales[0].amount
      })

      salesAnalyticsData.total_pos_sales = await SalesTransaction.query()
        .where("date", ">=", startDateISO)
        .andWhere("date", "<=", endDateISO)
        .andWhere("transaction_type", "=", "pos")
        .andWhere("active", "=", 1)
        .sum("amount as amount")
      salesAnalyticsData.statCards.push({
        mainTitle: "Total POS Sales",
        isMoney: true,
        value: salesAnalyticsData.total_pos_sales[0].amount
      })

      salesAnalyticsData.total_transfer_sales = await SalesTransaction.query()
        .where("date", ">=", startDateISO)
        .andWhere("date", "<=", endDateISO)
        .andWhere("transaction_type", "=", "transfer")
        .andWhere("active", "=", 1)
        .sum("amount as amount")
      salesAnalyticsData.statCards.push({
        mainTitle: "Total Transfer Sales",
        isMoney: true,
        value: salesAnalyticsData.total_transfer_sales[0].amount
      })

      salesAnalyticsData.statCards.push({
        mainTitle: "Total Payment Received",
        isMoney: true,
        value:
          salesAnalyticsData.total_transfer_sales[0].amount +
          salesAnalyticsData.total_cash_sales[0].amount +
          salesAnalyticsData.total_pos_sales[0].amount
      })

      salesAnalyticsData.statCards.push({
        mainTitle: "separator",
        value: "Sales Breakdown (Bookings & Orders)"
      })

      salesAnalyticsData.total_booking_sales = await Sale.query()
        .where("created_at", ">=", startDateISO)
        .andWhere("created_at", "<=", endDateISO)
        .andWhere("sellable_type", "=", "booking")
        .whereNull("merged_records")
        .sum("total_amount as amount")
      salesAnalyticsData.statCards.push({
        mainTitle: "Total Sales from Bookings",
        isMoney: true,
        value: salesAnalyticsData.total_booking_sales[0].amount
      })

      salesAnalyticsData.total_order_sales = await Sale.query()
        .where("created_at", ">=", startDateISO)
        .andWhere("created_at", "<=", endDateISO)
        .andWhere("sellable_type", "=", "order")
        .whereNull("merged_records")
        .sum("total_amount as amount")
      salesAnalyticsData.statCards.push({
        mainTitle: "Total Sales from Orders",
        isMoney: true,
        value: salesAnalyticsData.total_order_sales[0].amount
      })

      salesAnalyticsData.statCards.push({
        mainTitle: "separator",
        value: "Bookings Breakdown"
      })

      salesAnalyticsData.total_bookings = await Booking.query()
        .where("created_at", ">=", startDateISO)
        .andWhere("created_at", "<=", endDateISO)
        .resultSize()
      salesAnalyticsData.statCards.push({
        mainTitle: "Total Bookings",
        isMoney: false,
        value: salesAnalyticsData.total_bookings
      })

      salesAnalyticsData.total_closed_bookings = await Booking.query()
        .where("created_at", ">=", startDateISO)
        .andWhere("created_at", "<=", endDateISO)
        .andWhere("status", "=", "closed")
        .resultSize()
      salesAnalyticsData.statCards.push({
        mainTitle: "Total Closed Bookings",
        isMoney: false,
        value: salesAnalyticsData.total_closed_bookings
      })

      salesAnalyticsData.total_open_bookings = await Booking.query()
        .where("created_at", ">=", startDateISO)
        .andWhere("created_at", "<=", endDateISO)
        .andWhere("status", "=", "open")
        .resultSize()
      salesAnalyticsData.statCards.push({
        mainTitle: "Total Open Bookings",
        isMoney: false,
        value: salesAnalyticsData.total_open_bookings
      })

      salesAnalyticsData.total_cancelled_bookings = await Booking.query()
        .where("created_at", ">=", startDateISO)
        .andWhere("created_at", "<=", endDateISO)
        .andWhere("status", "=", "cancelled")
        .resultSize()
      salesAnalyticsData.statCards.push({
        mainTitle: "Total Cancelled Bookings",
        isMoney: false,
        value: salesAnalyticsData.total_cancelled_bookings
      })

      salesAnalyticsData.statCards.push({
        mainTitle: "separator",
        value: "Orders Breakdown"
      })

      salesAnalyticsData.total_pending_orders = await Order.query()
        .where("created_at", ">=", startDateISO)
        .andWhere("created_at", "<=", endDateISO)
        .andWhere("status", "=", "pending")
        .resultSize()
      salesAnalyticsData.statCards.push({
        mainTitle: "Total Pending Orders",
        isMoney: false,
        value: salesAnalyticsData.total_pending_orders
      })

      salesAnalyticsData.total_fulfilled_orders = await Order.query()
        .where("created_at", ">=", startDateISO)
        .andWhere("created_at", "<=", endDateISO)
        .andWhere("status", "=", "fulfilled")
        .resultSize()
      salesAnalyticsData.statCards.push({
        mainTitle: "Total Fulfilled Orders",
        isMoney: false,
        value: salesAnalyticsData.total_fulfilled_orders
      })

      salesAnalyticsData.total_cancelled_orders = await Order.query()
        .where("created_at", ">=", startDateISO)
        .andWhere("created_at", "<=", endDateISO)
        .andWhere("status", "=", "cancelled")
        .resultSize()
      salesAnalyticsData.statCards.push({
        mainTitle: "Total Cancelled Orders",
        isMoney: false,
        value: salesAnalyticsData.total_cancelled_orders
      })

      salesAnalyticsData.statCards.push({
        mainTitle: "separator",
        value: "Discounts & Complementary"
      })

      salesAnalyticsData.total_discount = await SalesTransaction.query()
        .where("date", ">=", startDateISO)
        .andWhere("date", "<=", endDateISO)
        .andWhere("transaction_type", "=", "discount")
        .andWhere("active", "=", 1)
        .sum("amount as amount")
      salesAnalyticsData.statCards.push({
        mainTitle: "Total Discount",
        isMoney: true,
        value: salesAnalyticsData.total_discount[0].amount
      })

      salesAnalyticsData.total_complementary = await SalesTransaction.query()
        .where("date", ">=", startDateISO)
        .andWhere("date", "<=", endDateISO)
        .andWhere("transaction_type", "=", "complementary")
        .andWhere("active", "=", 1)
        .sum("amount as amount")
      salesAnalyticsData.statCards.push({
        mainTitle: "Total Complementary",
        isMoney: true,
        value: salesAnalyticsData.total_complementary[0].amount
      })

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
