const { DateTime } = require("luxon")
const db = require(".../../../../src/data-access/db-config")
const OrdersController = require("../../../../src/modules/sales/OrdersController")
const Order = require("../../../../src/data-access/models/Order")
const SalesItem = require("../../../../src/data-access/models/SalesItem")
const Department = require("../../../../src/data-access/models/Department")

let oldOrder = null
let kitchenPendingOrder = null
let barPendingOrder = null
let kitchenCancelledOrder = null
let barCancelledOrder = null
let kitchenFulfilledOrder = null
let barFulfilledOrder = null
let barKitchenFulfilledOrder = null
let salesItems = []

async function populateOrdersTable() {
  oldOrder = await Order.query().insert({
    amount: 3000,
    status: "pending",
    departments: ["kitchen"],
    placed_by: { name: "some_name" },
    delivered_by: { name: "delivered name" },
    created_at: DateTime.local()
      .minus({ days: 100 })
      .toISODate(),
    updated_at: DateTime.local()
      .minus({ days: 100 })
      .toISODate()
  })

  kitchenPendingOrder = await Order.query().insert({
    amount: 3000,
    status: "pending",
    departments: ["kitchen"],
    placed_by: { name: "some_name" },
    delivered_by: { name: "delivered name" },
    created_at: DateTime.local().toISODate(),
    updated_at: DateTime.local().toISODate()
  })

  barPendingOrder = await Order.query().insert({
    amount: 3000,
    status: "pending",
    departments: ["bar"],
    placed_by: { name: "some_name" },
    delivered_by: { name: "delivered name" },
    created_at: DateTime.local().toISODate(),
    updated_at: DateTime.local().toISODate()
  })

  kitchenCancelledOrder = await Order.query().insert({
    amount: 3000,
    status: "cancelled",
    departments: ["kitchen"],
    placed_by: { name: "some_name" },
    delivered_by: { name: "delivered name" },
    created_at: DateTime.local()
      .minus({ days: 2 })
      .toISODate(),
    updated_at: DateTime.local()
      .minus({ days: 2 })
      .toISODate()
  })

  barCancelledOrder = await Order.query().insert({
    amount: 3000,
    status: "cancelled",
    departments: ["bar"],
    placed_by: { name: "some_name" },
    delivered_by: { name: "delivered name" },
    created_at: DateTime.local()
      .minus({ days: 2 })
      .toISODate(),
    updated_at: DateTime.local()
      .minus({ days: 2 })
      .toISODate()
  })

  kitchenFulfilledOrder = await Order.query().insert({
    amount: 3000,
    status: "fulfilled",
    departments: ["kitchen"],
    placed_by: { name: "some_name" },
    delivered_by: { name: "delivered name" },
    created_at: DateTime.local()
      .minus({ days: 10 })
      .toISODate(),
    updated_at: DateTime.local()
      .minus({ days: 10 })
      .toISODate()
  })

  barFulfilledOrder = await Order.query().insert({
    amount: 3000,
    status: "fulfilled",
    departments: ["bar"],
    placed_by: { name: "some_name" },
    delivered_by: { name: "delivered name" },
    created_at: DateTime.local()
      .minus({ days: 10 })
      .toISODate(),
    updated_at: DateTime.local()
      .minus({ days: 10 })
      .toISODate()
  })

  barKitchenFulfilledOrder = await Order.query().insert({
    amount: 3000,
    status: "fulfilled",
    departments: ["bar", "kitchen"],
    placed_by: { name: "some_name" },
    delivered_by: { name: "delivered name" },
    created_at: DateTime.local()
      .minus({ days: 10 })
      .toISODate(),
    updated_at: DateTime.local()
      .minus({ days: 10 })
      .toISODate()
  })
}

async function populateSalesItemsTable() {
  salesItems = []
  await Department.query().delete()
  await SalesItem.query().delete()

  let kitchen = await Department.query().insert({ name: "kitchen" })
  let bar = await Department.query().insert({ name: "bar" })

  let heineken = await SalesItem.query().insert({
    name: "Heineken",
    unit: "bottle",
    price_per_unit: 5000,
    department_id: bar.id
  })

  let beer = await SalesItem.query().insert({
    name: "Beer",
    unit: "bottle",
    price_per_unit: 3000,
    department_id: bar.id
  })

  let rice = await SalesItem.query().insert({
    name: "rice",
    unit: "plate",
    price_per_unit: 3000,
    department_id: kitchen.id
  })
  salesItems.push(heineken, beer, rice)
}

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

beforeEach(async () => {
  await Order.query().delete()
})

afterAll(async () => {
  await Order.query().delete()
  await Department.query().delete()
  await SalesItem.query().delete()
})

test("OrdersController.index returns list of orders created in last 90 days by default", async () => {
  await populateOrdersTable()
  let req = { query: null }
  let res = { json: jest.fn() }
  await OrdersController.index(req, res)
  let startDate = DateTime.local()
    .minus({ days: 90 })
    .toISODate()
  let endDate = DateTime.local().toISODate()

  expect(res.json).toHaveBeenCalledWith({
    start_date: startDate,
    end_date: endDate,
    orders: expect.arrayContaining([
      expect.objectContaining(kitchenFulfilledOrder),
      expect.objectContaining(kitchenCancelledOrder),
      expect.objectContaining(kitchenPendingOrder),
      expect.objectContaining(barPendingOrder),
      expect.objectContaining(barCancelledOrder),
      expect.objectContaining(barFulfilledOrder),
      expect.objectContaining(barKitchenFulfilledOrder)
    ])
  })
  expect(res.json).toHaveBeenCalledWith({
    start_date: startDate,
    end_date: endDate,
    orders: expect.not.arrayContaining([expect.objectContaining(oldOrder)])
  })
})

test("OrdersController.index successfully filters orders by date", async () => {
  await populateOrdersTable()
  // get orders for 2 days ago
  let startDate = DateTime.local()
    .minus({ days: 3 })
    .toISODate()
  let endDate = DateTime.local()
    .minus({ days: 2 })
    .toISODate()
  let req = {
    query: {
      start_date: startDate,
      end_date: endDate
    }
  }
  let output = {}
  let res = {
    json: jest.fn((result) => {
      output = result
    })
  }
  await OrdersController.index(req, res)
  expect(res.json).toHaveBeenLastCalledWith({
    start_date: startDate,
    end_date: endDate,
    orders: expect.arrayContaining([
      expect.objectContaining(barCancelledOrder),
      expect.objectContaining(kitchenCancelledOrder)
    ])
  })
  expect(output.orders).toHaveLength(2)
})

test("OrdersController.index successfully filters orders by status", async () => {
  await populateOrdersTable()
  let startDate = DateTime.local()
    .minus({ days: 90 })
    .toISODate()
  let endDate = DateTime.local().toISODate()

  let req = { query: { status: "pending" } }
  let output = null
  let res = {
    json: jest.fn((arg) => {
      output = arg
    })
  }
  await OrdersController.index(req, res)
  expect(output.orders).toHaveLength(2)
  expect(res.json).toHaveBeenLastCalledWith({
    start_date: startDate,
    end_date: endDate,
    orders: expect.arrayContaining([
      expect.objectContaining(barPendingOrder),
      expect.objectContaining(kitchenPendingOrder)
    ])
  })
})

test("OrdersController.index successfully filters orders by department", async () => {
  await populateOrdersTable()
  let startDate = DateTime.local()
    .minus({ days: 90 })
    .toISODate()
  let endDate = DateTime.local().toISODate()

  let req = { query: { department: "kitchen" } }
  let output = null
  let res = {
    json: jest.fn((arg) => {
      output = arg
    })
  }
  await OrdersController.index(req, res)
  expect(output.orders).toHaveLength(4)
  expect(res.json).toHaveBeenLastCalledWith({
    start_date: startDate,
    end_date: endDate,
    orders: expect.arrayContaining([
      expect.objectContaining(kitchenCancelledOrder),
      expect.objectContaining(kitchenPendingOrder),
      expect.objectContaining(kitchenFulfilledOrder),
      expect.objectContaining(barKitchenFulfilledOrder)
    ])
  })
})

test("OrdersController.create returns the newly created order and its order items when passed valid data", async () => {
  await populateSalesItemsTable()
  let req = {
    get: jest.fn(),
    body: {
      destination: "Bar",
      item_details: [
        { sales_item_id: salesItems[0].id, quantity: 3 },
        { sales_item_id: salesItems[1].id, quantity: 1 },
        { sales_item_id: salesItems[2].id, quantity: 3 }
      ]
    }
  }
  req.get.mockReturnValue("authenticated user")
  let output = null
  let res = {
    json: jest.fn((arg) => {
      output = arg
    })
  }
  await OrdersController.create(req, res)
  expect(res.json).toHaveBeenCalledTimes(1)
  expect(res.json).toHaveBeenLastCalledWith(
    expect.objectContaining({
      amount: 27000,
      status: "pending",
      departments: ["bar", "kitchen"]
    })
  )
})

test("OrdersController.create returns error message when passed invalid data", async () => {
  let req = {
    get: jest.fn(),
    body: {
      destination: "Bar",
      item_details: [
        { sales_item_id: 5, quantity: 3 },
        { sales_item_id: 3, quantity: 1 },
        { sales_item_id: 2, quantity: 3 }
      ]
    }
  }
  req.get.mockReturnValue("authenticated user")
  let res = {
    json: jest.fn(),
    status: jest.fn()
  }
  res.status.mockReturnThis()
  await OrdersController.create(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["error: could not create order"] })
})

test("OrdersController.updateOrderDetails successfully updates order status with valid status", async () => {
  let order = await Order.query().insert({
    amount: 9000,
    created_at: DateTime.local().toISODate(),
    updated_at: DateTime.local().toISODate(),
    status: "pending",
    departments: ["bar", "kitchen"],
    placed_by: { name: "some name" },
    delivered_by: { name: "some name" }
  })
  let req = {
    params: { id: order.id },
    body: { status: "fulfilled" }
  }
  let res = { json: jest.fn() }
  await OrdersController.updateOrderDetails(req, res)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["successfully updated order status"] })
})

test("OrdersController.updateOrderDetails returns error message when passed invalid order status and id", async () => {
  let req = {
    params: { id: 3 },
    body: { status: "fulfilled" }
  }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await OrdersController.updateOrderDetails(req, res)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["could not update the selected order"] })
  expect(res.status).toHaveBeenLastCalledWith(400)

  let order = await Order.query().insert({
    amount: 9000,
    created_at: DateTime.local().toISODate(),
    updated_at: DateTime.local().toISODate(),
    status: "pending",
    departments: ["bar", "kitchen"],
    placed_by: { name: "some name" },
    delivered_by: { name: "some name" }
  })

  req = {
    params: { id: order.id },
    body: { status: "an-invalid-status" }
  }

  await OrdersController.updateOrderDetails(req, res)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["invalid order status"] })
  expect(res.status).toHaveBeenLastCalledWith(400)
})

test("OrdersController.updateOrderDetails returns error message when passed invalid cancellation_remarks", async () => {
  let order = await Order.query().insert({
    amount: 9000,
    created_at: DateTime.local().toISODate(),
    updated_at: DateTime.local().toISODate(),
    status: "pending",
    departments: ["bar", "kitchen"],
    placed_by: { name: "some name" },
    delivered_by: { name: "some name" }
  })

  let req = {
    params: { id: order.id },
    body: { status: "cancelled" }
  }
  let res = { status: jest.fn(), json: jest.fn() }
  res.status.mockReturnThis()

  await OrdersController.updateOrderDetails(req, res)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["you need to provide a reason for cancellation"] })
  expect(res.status).toHaveBeenLastCalledWith(400)
})

test("OrdersController.show successfully returns selected order", async () => {
  let order = await Order.query().insert({
    amount: 9000,
    created_at: DateTime.local().toISODate(),
    updated_at: DateTime.local().toISODate(),
    status: "pending",
    departments: ["bar", "kitchen"],
    placed_by: { name: "some name" },
    delivered_by: { name: "some name" }
  })

  let req = { params: { id: order.id } }
  let res = { json: jest.fn() }

  await OrdersController.show(req, res)
  expect(res.json).toHaveBeenLastCalledWith(expect.objectContaining(order))
})

test("OrdersController.show returns error message when passed invalid order id", async () => {
  let req = { params: { id: 23 } }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()

  await OrdersController.show(req, res)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["could not find selected order"] })
  expect(res.status).toHaveBeenLastCalledWith(400)
})

test("OrdersController.modifyOrder returns the modified order after adding the order history", async () => {
  await populateSalesItemsTable()
  let order = await Order.query().insert({
    amount: 2000,
    created_at: DateTime.local()
      .minus({ days: 1 })
      .toISO(),
    updated_at: DateTime.local().toISO(),
    status: "pending",
    departments: ["kitchen"],
    placed_by: { name: "some name" },
    destination: "Bar",
    delivered_by: { name: "delivered_by" }
  })

  let req = {
    get: jest.fn(),
    params: { id: order.id },
    body: {
      destination: "Bar",
      item_details: [
        { sales_item_id: salesItems[0].id, quantity: 1 },
        { sales_item_id: salesItems[1].id, quantity: 1 }
      ]
    }
  }
  req.get.mockReturnValue("authenticated user")
  let response = null
  let res = {
    json: jest.fn((arg) => {
      response = arg
    })
  }

  await OrdersController.modifyOrder(req, res)
  expect(response.amount).toEqual(8000)
  expect(response.placed_by).toEqual({ name: "authenticated user authenticated user" })
  expect(response.created_at).toEqual(order.created_at)
})

test("OrdersController.modifyOrder returns error message when passed an order that isn't pending", async () => {
  await populateSalesItemsTable()
  let order = await Order.query().insert({
    amount: 2000,
    created_at: DateTime.local().toISO(),
    updated_at: DateTime.local().toISO(),
    status: "fulfilled",
    departments: ["kitchen"],
    placed_by: { name: "some name" },
    destination: "Bar",
    delivered_by: { name: "delivered_by" }
  })

  let req = {
    get: jest.fn(),
    params: { id: order.id },
    body: {
      destination: "Bar",
      item_details: [
        { sales_item_id: salesItems[0].id, quantity: 1 },
        { sales_item_id: salesItems[1].id, quantity: 1 }
      ]
    }
  }
  req.get.mockReturnValue("authenticated user")
  let response = null
  let res = {
    status: jest.fn(),
    json: jest.fn((arg) => {
      response = arg
    })
  }

  res.status.mockReturnThis()
  await OrdersController.modifyOrder(req, res)
  expect(response.messages).toEqual(["you cannot modify an order that isn't pending"])
})
