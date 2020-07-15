const { DateTime } = require("luxon")
const _ = require("lodash")
const { ValidationError, NotFoundError } = require("objection")
const Order = require("../../data-access/models/Order")
const SalesItem = require("../../data-access/models/SalesItem")

module.exports = {
  async index(req, res) {
    try {
      let startDate = _.get(req, ["query", "start_date"])
        ? req.query.start_date
        : DateTime.local()
            .minus({ days: 90 })
            .toISODate()
      let endDate = _.get(req, ["query", "end_date"]) ? req.query.end_date : DateTime.local().toISODate()

      endDate = DateTime.fromISO(endDate)
        .plus({ days: 1 })
        .toISODate()

      let orders = await Order.query()
        .where("created_at", ">=", startDate)
        .andWhere("created_at", "<=", endDate)
        .withGraphFetched("order_items")
        .withGraphFetched("sale")

      if (_.get(req, ["query", "status"]) != null) {
        orders = orders.filter((el) => {
          return el.status === req.query.status
        })
      }

      if (_.get(req, ["query", "department"]) != null) {
        orders = orders.filter((el) => {
          return el.departments.includes(req.query.department)
        })
      }

      res.json({ start_date: startDate, end_date: endDate, orders: orders })
    } catch (error) {
      res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async create(req, res) {
    try {
      let orderItems = []
      let orderAmount = 0
      let departments = []

      // eslint-disable-next-line no-restricted-syntax
      for (let item of _.get(req, ["body", "item_details"])) {
        // eslint-disable-next-line no-await-in-loop
        let salesItem = await SalesItem.query()
          .findById(_.toNumber(item.sales_item_id))
          .withGraphFetched("department")
          .throwIfNotFound()

        let amount = _.toNumber(item.quantity) * salesItem.price_per_unit
        orderAmount += amount
        orderItems.push({
          amount: amount,
          sales_item_id: salesItem.id,
          quantity: item.quantity,
          unit: salesItem.unit,
          name: salesItem.name,
          date: DateTime.local().toISODate(),
          price_per_unit: salesItem.price_per_unit
        })
        if (salesItem.department && !departments.includes(salesItem.department.name)) {
          departments.push(salesItem.department.name)
        }
      }

      let order = await Order.query().insertGraphAndFetch({
        amount: orderAmount,
        created_at: DateTime.local().toISO(),
        updated_at: DateTime.local().toISO(),
        status: "pending",
        departments: departments,
        placed_by: { name: `${req.get("first_name")} ${req.get("last_name")}` },
        delivered_by: { name: _.get(req, ["body", "delivered_by"]) },
        destination: _.get(req, ["body", "destination"]),
        order_items: orderItems
      })
      return res.json(order)
    } catch (error) {
      return res.status(400).json({ messages: ["error: could not create order"] })
    }
  },

  async updateOrderStatus(req, res) {
    try {
      if (_.get(req, ["body", "status"]) === "cancelled" && _.get(req, ["body", "cancellation_remarks"]) == null) {
        return res.status(400).json({ messages: ["you need to provide a reason for cancellation"] })
      }
      let order = await Order.query()
        .findById(_.toNumber(req.params.id))
        .patch({
          status: _.get(req, ["body", "status"]),
          cancellation_remarks: _.get(req, ["body", "cancellation_remarks"]),
          updated_at: DateTime.local().toISO(),
          delivered_by: _.get(req, ["body", "delivered_by"])
        })
        .throwIfNotFound()
      return res.json({ messages: ["successfully updated order status"] })
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ messages: ["invalid order status"] })
      }

      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not update the selected order"] })
      }

      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async show(req, res) {
    try {
      let order = await Order.query()
        .findById(_.toNumber(req.params.id))
        .withGraphFetched("order_items")
        .withGraphFetched("sale")
        .throwIfNotFound()
      return res.json(order)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not find selected order"] })
      }
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  }
}
