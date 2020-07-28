const { DateTime } = require("luxon")
const Department = require("../../../../../src/data-access/models/Department")
const SalesItem = require("../../../../../src/data-access/models/SalesItem")
const Order = require("../../../../../src/data-access/models/Order")
const OrderItem = require("../../../../../src/data-access/models/OrderItem")

let salesItems = []
let departments = []
let orderItems = []
let orders = []

module.exports = {
  async populateOrderItemsData() {
    resetData()

    await populateDepartmentAndSalesItems()

    await populateOrderWithOrderItems("fulfilled")
    await populateOrderWithOrderItems("cancelled")
    await populateOrderWithOrderItems("pending")

    let oldDate = DateTime.local()
      .minus({ days: 100 })
      .toISODate()
    await populateOrderWithOrderItems("fulfilled", oldDate)
    await populateOrderWithOrderItems("cancelled", oldDate)
    await populateOrderWithOrderItems("pending", oldDate)

    let twentyDaysAgoDate = DateTime.local()
      .minus({ days: 20 })
      .toISODate()
    await populateOrderWithOrderItems("fulfilled", twentyDaysAgoDate)

    return {
      salesItems: salesItems,
      orderItems: orderItems,
      departments: departments,
      orders: orders
    }
  },

  async deleteAllDataFromDB() {
    await Department.query().delete()
    await SalesItem.query().delete()
    await Order.query().delete()
    await OrderItem.query().delete()
  }
}

function resetData() {
  salesItems = []
  departments = []
  orderItems = []
  orders = []
}

async function populateOrderWithOrderItems(status = "fulfilled", createdAtDate = DateTime.local().toISODate()) {
  let order = await Order.query().insert({
    amount: 1000,
    created_at: createdAtDate,
    status: status,
    departments: ["kitchen", "bar"],
    placed_by: { name: "some name" },
    destination: "garden"
  })
  orders.push(order)

  let amalaOrderItem = await OrderItem.query().insert({
    amount: 1000,
    order_id: order.id,
    sales_item_id: salesItems[0].id, // amala is the first sales item in this list
    quantity: 2,
    unit: "plate",
    name: "amala",
    date: createdAtDate,
    price_per_unit: 500
  })
  orderItems.push(amalaOrderItem)

  let egusiOrderItem = await OrderItem.query().insert({
    amount: 1000,
    order_id: order.id,
    sales_item_id: salesItems[1].id,
    quantity: 1,
    unit: "plate",
    name: "egusi",
    date: createdAtDate,
    price_per_unit: 500
  })
  orderItems.push(egusiOrderItem)

  let heinekenOrderItem = await OrderItem.query().insert({
    amount: 3000,
    order_id: order.id,
    sales_item_id: salesItems[2].id,
    quantity: 2,
    unit: "bottle",
    name: "heineken",
    date: createdAtDate,
    price_per_unit: 1500
  })
  orderItems.push(heinekenOrderItem)

  let maltOrderItem = await OrderItem.query().insert({
    amount: 300,
    order_id: order.id,
    sales_item_id: salesItems[3].id,
    quantity: 1,
    unit: "bottle",
    name: "malt",
    date: createdAtDate,
    price_per_unit: 300
  })
  orderItems.push(maltOrderItem)
}

async function populateDepartmentAndSalesItems() {
  let kitchen = await Department.query().insert({ name: "kitchen" })
  departments.push(kitchen)

  let amala = await SalesItem.query().insert({
    name: "amala",
    unit: "plate",
    price_per_unit: 500,
    department_id: kitchen.id
  })
  salesItems.push(amala)

  let egusi = await SalesItem.query().insert({
    name: "egusi",
    unit: "plate",
    price_per_unit: 500,
    department_id: kitchen.id
  })
  salesItems.push(egusi)

  let bar = await Department.query().insert({ name: "bar" })
  departments.push(bar)

  let heineken = await SalesItem.query().insert({
    name: "heineken",
    unit: "bottle",
    price_per_unit: 1500,
    department_id: bar.id
  })
  salesItems.push(heineken)

  let malt = await SalesItem.query().insert({
    name: "malt",
    unit: "bottle",
    price_per_unit: 300,
    department_id: bar.id
  })
  salesItems.push(malt)
}
