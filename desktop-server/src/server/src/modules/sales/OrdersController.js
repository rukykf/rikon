const { DateTime } = require("luxon")
const _ = require("lodash")
const { ValidationError, NotFoundError } = require("objection")
const Order = require("../../data-access/models/Order")
const SalesItem = require("../../data-access/models/SalesItem")
const CreateOrderRequestModel = require("./RequestModels/CreateOrderRequestModel")
const ModifyOrderRequestModel = require("./RequestModels/ModifyOrderRequestModel")
const ValidationException = require("../Exceptions/ValidationException")
const UpdateOrderDetailsRequestModel = require("./RequestModels/UpdateOrderDetailsRequestModel")
const logger = require("../../utils/Logger")

module.exports = {
  async index(req, res) {
    try {
      let startDate = _.get(req, ["query", "start_date"])
        ? req.query.start_date
        : DateTime.local()
            .minus({ days: 90 })
            .toISODate()
      let endDate = _.get(req, ["query", "end_date"])
        ? req.query.end_date
        : DateTime.local()
            .plus({ days: 1 })
            .toISODate()

      let orders = await Order.query()
        .where("created_at", ">=", startDate)
        .andWhere("created_at", "<=", endDate)
        .andWhere("active", "=", 1)
        .withGraphFetched("order_items")
        .withGraphFetched("sale")
        .orderBy("created_at", "desc")

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
      let createOrderRequest = new CreateOrderRequestModel(req)
      let order = await createOrder(createOrderRequest)
      return res.json(order)
    } catch (error) {
      logger.logRequestError(req, error, "Error creating order... see below for error details")
      if (error instanceof ValidationException) {
        return res.status(400).json({ messages: error.messages })
      }

      return res.status(400).json({ messages: ["error: could not create order"] })
    }
  },

  async updateOrderDetails(req, res) {
    try {
      let orderDetailsForUpdate = new UpdateOrderDetailsRequestModel(req)

      if (orderDetailsForUpdate.status === "cancelled" && orderDetailsForUpdate.cancellation_remarks == null) {
        return res.status(400).json({ messages: ["you need to provide a reason for cancellation"] })
      }
      let order = await Order.query()
        .findById(_.toNumber(req.params.id))
        .patch(orderDetailsForUpdate)
        .throwIfNotFound()
      return res.json({ messages: ["successfully updated order status"] })
    } catch (error) {
      logger.logRequestError(req, error, "Could not update order status, see error details below")
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
  },

  /**
   * You technically cannot modify an order. What happens here is that you create a new order and add the old order
   * to the history of that new order
   *
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  async modifyOrder(req, res) {
    try {
      let modifyOrderRequest = new ModifyOrderRequestModel(req)
      let oldOrder = await Order.query().findById(modifyOrderRequest.oldOrderId)

      if (oldOrder.status !== "pending") {
        return res.status(400).json({ messages: ["you cannot modify an order that isn't pending"] })
      }

      await Order.query().patchAndFetchById(modifyOrderRequest.oldOrderId, {
        active: false
      })

      let newOrder = await processModifyOrder(modifyOrderRequest.newOrderRequest, oldOrder)
      let oldOrderIds = oldOrder.old_order_ids != null ? oldOrder.old_order_ids : []
      oldOrderIds.push(oldOrder.id)

      await Order.query()
        .findById(newOrder.id)
        .patch({
          old_order_ids: oldOrderIds
        })

      return res.json(newOrder)
    } catch (error) {
      logger.logRequestError(req, error, "Could not update the order, see error details below")
      if (error instanceof ValidationException) {
        return res.status(400).json({ messages: error.messages })
      }

      return res.status(400).json({ messages: ["error: could not modify order"] })
    }
  }
}

// private methods
async function createOrder(createOrderRequest) {
  let orderItems = []
  let orderAmount = 0
  let departments = []

  orderAmount = await processOrderItems(createOrderRequest, orderAmount, orderItems, departments)

  let order = await Order.query().insertGraphAndFetch({
    amount: orderAmount,
    created_at: DateTime.local().toISO(),
    updated_at: DateTime.local().toISO(),
    status: "pending",
    departments: departments,
    placed_by: createOrderRequest.placedBy,
    destination: createOrderRequest.destination,
    order_items: orderItems,
    active: 1
  })
  return order
}

async function processModifyOrder(createOrderRequest, oldOrder) {
  let orderItems = []
  let orderAmount = 0
  let departments = []

  orderAmount = await processOrderItems(createOrderRequest, orderAmount, orderItems, departments)

  let order = await Order.query().insertGraphAndFetch({
    amount: orderAmount,
    created_at: oldOrder.created_at,
    updated_at: DateTime.local().toISO(),
    status: "pending",
    departments: departments,
    placed_by: createOrderRequest.placedBy,
    delivered_by: oldOrder.delivered_by != null ? oldOrder.delivered_by : {},
    destination: createOrderRequest.destination,
    order_items: orderItems
  })
  return order
}

async function processOrderItems(createOrderRequest, orderAmount, orderItems, departments) {
  // eslint-disable-next-line no-restricted-syntax
  for (let item of createOrderRequest.itemDetails) {
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
  return orderAmount
}
