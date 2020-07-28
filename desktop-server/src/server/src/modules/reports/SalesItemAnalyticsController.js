const SalesItemsOrderQuantityBreakdownRequestModel = require("./RequestModels/SalesItemQuantityBreakdownRequestModel")
const db = require("../../data-access/db-config")

module.exports = {
  async getQuantityBreakdownForSalesItems(req, res) {
    try {
      let requestModel = new SalesItemsOrderQuantityBreakdownRequestModel(req)
      let queryParams = {
        startDate: requestModel.start_date,
        endDate: requestModel.end_date
      }

      let joinSalesItemsString = ""
      let filterByDepartmentString = ""

      if (requestModel.department_id != null) {
        joinSalesItemsString = "join sales_items on order_items.sales_item_id = sales_items.id"
        filterByDepartmentString = "and sales_items.department_id = :departmentId"
        queryParams.departmentId = requestModel.department_id
      }

      let salesItemsBreakdownQueryString = `select order_items.name as name, sum(order_items.quantity) as quantity from order_items join orders on order_items.order_id = orders.id ${joinSalesItemsString} where orders.status = 'fulfilled' and orders.created_at >= :startDate and orders.created_at <= :endDate ${filterByDepartmentString} group by order_items.name order by order_items.name`
      let salesItemsQuantityBreakdown = await db.raw(salesItemsBreakdownQueryString, queryParams)
      return res.json(salesItemsQuantityBreakdown)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  }
}
