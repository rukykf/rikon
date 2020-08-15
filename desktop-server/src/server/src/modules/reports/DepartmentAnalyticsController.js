const db = require("../../data-access/db-config")
const Sale = require("../../data-access/models/Sale")
const Booking = require("../../data-access/models/Booking")
const Order = require("../../data-access/models/Order")

const BookingSalesBreakdownRequest = require("./RequestModels/BookingSalesBreakdownRequest")
const SalesBreakdownResponse = require("./ResponseModels/SalesBreakdownResponseModel")
const DepartmentSalesBreakdownRequest = require("./RequestModels/DepartmentSalesBreakdownRequest")

module.exports = {
  async getDepartmentSalesBreakdownFromSalesTable(req, res) {
    try {
      let departmentSalesBreakdownRequest = new DepartmentSalesBreakdownRequest(req)

      let filterByDateQuery = "and sales.item_created_at >= :startDate and sales.item_created_at <= :endDate"
      let filterByDepartmentQuery = ""

      if (departmentSalesBreakdownRequest.department_id !== null) {
        filterByDepartmentQuery = "and sales.department_id = :departmentId"
      }

      // pos, cash and transfer breakdown
      let queryParams = {
        startDate: departmentSalesBreakdownRequest.start_date,
        endDate: departmentSalesBreakdownRequest.end_date,
        paymentMethod: "cash",
        departmentId: departmentSalesBreakdownRequest.department_id
      }

      let paymentMethodAggregateQuery = `select sum(amount) as total_amount from sales join sales_transactions on sales.id = sales_transactions.sales_id where sales.active = 1 and sales_transactions.transaction_type = :paymentMethod ${filterByDepartmentQuery} ${filterByDateQuery}`
      let { total_amount: totalCash } = await db.raw(paymentMethodAggregateQuery, queryParams)

      queryParams.paymentMethod = "pos"
      let { total_amount: totalPOS } = await db.raw(paymentMethodAggregateQuery, queryParams)

      queryParams.paymentMethod = "transfer"
      let { total_amount: totalTransfer } = await db.raw(paymentMethodAggregateQuery, queryParams)

      // total sales and total debt
      let totalSalesQuery = `select sum(total_amount) as total_sales from sales where sales.active = 1 ${filterByDepartmentQuery} ${filterByDateQuery}`
      let { total_sales: totalSales } = await db.raw(totalSalesQuery, queryParams)

      let totalDebtQuery = `select sum(total_due) as total_debt from sales where sales.active = 1 ${filterByDepartmentQuery} ${filterByDateQuery}`
      let { total_debt: totalDebt } = await db.raw(totalDebtQuery, queryParams)

      // discount, complementary and company
      let totalDiscountQuery = `select sum(total_complementary) as total_discount from sales where sales.active = 1 ${filterByDepartmentQuery} ${filterByDateQuery}`
    } catch (error) {
      res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  },

  async getDepartmentSalesBreakdownFromOrdersTable(req, res) {
    try {
      let departmentSalesBreakdownRequest = new DepartmentSalesBreakdownRequest(req)

      let orders = await Order.query()
        .where("created_at", ">=", departmentSalesBreakdownRequest.start_date)
        .andWhere("created_at", "<=", departmentSalesBreakdownRequest.end_date)
        .andWhere("status", "fulfilled")

      let departmentOrderIDs = []

      orders.forEach((order) => {
        if (
          departmentSalesBreakdownRequest.department_name === null ||
          order.departments.includes(departmentSalesBreakdownRequest.department_name)
        ) {
          departmentOrderIDs.push(order.id)
        }
      })

      let response = new SalesBreakdownResponse()
      let cashSales = await Order.query()
        .withGraphJoined("sale.sales_transactions")
        .whereIn("orders.id", departmentOrderIDs)
        .andWhere("sale:sales_transactions:active", "=", 1)
        .andWhere("sale:sales_transactions:transaction_type", "=", "cash")
        .sum("sale:sales_transactions.amount as totalCash")

      response.totalCashSales = cashSales[0] != null ? cashSales[0].totalCash : 0

      let transferSales = await Order.query()
        .withGraphJoined("sale.sales_transactions")
        .whereIn("orders.id", departmentOrderIDs)
        .andWhere("sale:sales_transactions:active", "=", 1)
        .andWhere("sale:sales_transactions:transaction_type", "=", "transfer")
        .sum("sale:sales_transactions.amount as totalTransfer")

      response.totalTransferSales = transferSales[0] != null ? transferSales[0].totalTransfer : 0

      let posSales = await Order.query()
        .withGraphJoined("sale.sales_transactions")
        .whereIn("orders.id", departmentOrderIDs)
        .andWhere("sale:sales_transactions:active", "=", 1)
        .andWhere("sale:sales_transactions:transaction_type", "=", "pos")
        .sum("sale:sales_transactions.amount as totalPOS")

      response.totalPOSSales = posSales[0] != null ? posSales[0].totalPOS : 0

      let debtSales = await Order.query()
        .withGraphJoined("sale")
        .whereIn("orders.id", departmentOrderIDs)
        .sum("sale.total_due as totalDebt")

      response.totalDebt = debtSales[0] != null ? debtSales[0].totalDebt : 0

      res.status(200).json(response)
    } catch (error) {
      res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  },

  async getBookingsSalesBreakdown(req, res) {
    try {
      let bookingSalesBreakdownRequestModel = new BookingSalesBreakdownRequest(req)

      let posSales = await Booking.query()
        .withGraphJoined("sale.sales_transactions")
        .where("bookings.created_at", ">=", bookingSalesBreakdownRequestModel.start_date)
        .andWhere("bookings.created_at", "<=", bookingSalesBreakdownRequestModel.end_date)
        .andWhere("sale:sales_transactions:active", "=", 1)
        .andWhere("sale:sales_transactions:transaction_type", "=", "pos")
        .sum("sale:sales_transactions.amount as totalPOS")

      let totalPOSSales = posSales[0] != null ? posSales[0].totalPOS : 0

      let cashSales = await Booking.query()
        .withGraphJoined("sale.sales_transactions")
        .where("bookings.created_at", ">=", bookingSalesBreakdownRequestModel.start_date)
        .andWhere("bookings.created_at", "<=", bookingSalesBreakdownRequestModel.end_date)
        .andWhere("sale:sales_transactions:active", "=", 1)
        .andWhere("sale:sales_transactions:transaction_type", "=", "cash")
        .sum("sale:sales_transactions.amount as totalCash")

      let totalCashSales = cashSales[0] != null ? cashSales[0].totalCash : 0

      let transferSales = await Booking.query()
        .withGraphJoined("sale.sales_transactions")
        .where("bookings.created_at", ">=", bookingSalesBreakdownRequestModel.start_date)
        .andWhere("bookings.created_at", "<=", bookingSalesBreakdownRequestModel.end_date)
        .andWhere("sale:sales_transactions:active", "=", 1)
        .andWhere("sale:sales_transactions:transaction_type", "=", "transfer")
        .sum("sale:sales_transactions.amount as totalTransfer")

      let totalTranferSales = transferSales[0] != null ? transferSales[0].totalTransfer : 0

      let debtSales = await Booking.query()
        .withGraphJoined("sale")
        .where("bookings.created_at", ">=", bookingSalesBreakdownRequestModel.start_date)
        .andWhere("bookings.created_at", "<=", bookingSalesBreakdownRequestModel.end_date)
        .sum("sale.total_due as totalDebt")

      let totalDebt = debtSales[0] != null ? debtSales[0].totalDebt : 0

      let response = new SalesBreakdownResponse(totalCashSales, totalTranferSales, totalPOSSales, totalDebt)
      return res.status(200).json(response)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  }
}
