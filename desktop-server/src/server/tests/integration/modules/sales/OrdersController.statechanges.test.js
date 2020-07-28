const { DateTime } = require("luxon")

const db = require(".../../../../src/data-access/db-config")
const SalesItem = require("../../../../src/data-access/models/SalesItem")
const Department = require("../../../../src/data-access/models/Department")
const Order = require("../../../../src/data-access/models/Order")
const OrdersController = require("../../../../src/modules/sales/OrdersController")

let salesItems = []

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
  await populateSalesItemsTable()
})

test("OrdersController.modifyOrder deactivates the old order", async () => {
  let order = await Order.query().insert({
    amount: 2000,
    created_at: DateTime.local().toISO(),
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
      delivered_by: {
        name: "Rikon Waiter"
      },
      item_details: [
        { sales_item_id: salesItems[0].id, quantity: 1 },
        { sales_item_id: salesItems[1].id, quantity: 1 }
      ],
      destination: "Bar"
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

  let updatedOldOrder = await Order.query().findById(order.id)
  expect(updatedOldOrder.active).toEqual(0)
})

test("OrdersController.modifyOrder adds the old order to the new order's old_order_ids property", async () => {
  let oldOrder = await Order.query().insert({
    amount: 2000,
    created_at: DateTime.local().toISO(),
    updated_at: DateTime.local().toISO(),
    status: "pending",
    departments: ["kitchen"],
    placed_by: { name: "some name" },
    destination: "Bar",
    delivered_by: { name: "delivered_by" },
    old_order_ids: [23, 24]
  })

  let req = {
    get: jest.fn(),
    params: { id: oldOrder.id },
    body: {
      delivered_by: "Rikon Waiter",
      item_details: [
        { sales_item_id: salesItems[0].id, quantity: 1 },
        { sales_item_id: salesItems[1].id, quantity: 1 }
      ],
      destination: "Bar"
    }
  }
  req.get.mockReturnValue("authenticated user")
  let newOrder = null
  let res = {
    json: jest.fn((arg) => {
      newOrder = arg
    })
  }
  await OrdersController.modifyOrder(req, res)

  let output = await Order.query().findById(newOrder.id)
  expect(output.old_order_ids).toEqual([23, 24, oldOrder.id])
})

test("OrdersController.updateOrderDetails only modifies provided fields from request", async () => {
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
    body: { status: "fulfilled", placed_by: { name: "another name" } }
  }

  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()

  await OrdersController.updateOrderDetails(req, res)
  let updatedOrder = await Order.query().findById(order.id)
  expect(updatedOrder.status).toEqual("fulfilled")
  expect(updatedOrder.placed_by).toEqual({ name: "another name" })
  expect(updatedOrder.delivered_by).toEqual({ name: "some name" })
})

async function populateSalesItemsTable() {
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
