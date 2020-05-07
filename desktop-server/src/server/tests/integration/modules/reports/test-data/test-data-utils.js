const { DateTime } = require("luxon")
const Order = require("../../../../../src/data-access/models/Order")
const SalesItem = require("../../../../../src/data-access/models/SalesItem")
const Sale = require("../../../../../src/data-access/models/Sale")
const Department = require("../../../../../src/data-access/models/Department")
const OrderItem = require("../../../../../src/data-access/models/OrderItem")

module.exports = {
  async populateMonthlySales() {
    let date = DateTime.local()
    let sales = []

    for (let i = 0; i < 12; i++) {
      // add 2 sales totalling 10000 for each month

      let sale = await Sale.query().insert({
        created_at: date.toISODate(),
        updated_at: date.toISODate(),
        total_amount: 5000,
        total_paid: 0,
        total_complementary: 0,
        total_due: 0,
        sellable_id: 1,
        sellable_type: "booking",
        status: "owing"
      })
      sales.push(sale)

      sale = await Sale.query().insert({
        created_at: date.toISODate(),
        updated_at: date.toISODate(),
        total_amount: 5000,
        total_paid: 0,
        total_complementary: 0,
        total_due: 0,
        sellable_id: 2,
        sellable_type: "booking",
        status: "owing"
      })
      sales.push(sale)
      date = date.minus({ months: 1 })
    }
    return sales
  },

  async populateMonthlyOrders() {
    let date = DateTime.local()
    let orders = []

    for (let i = 0; i < 12; i++) {
      let order = await Order.query().insert({
        created_at: date.toISODate(),
        updated_at: date.toISODate(),
        status: "cancelled",
        departments: ["kitchen"],
        placed_by: { name: "some name" },
        amount: 5000
      })
      orders.push(order)

      order = await Order.query().insert({
        created_at: date.toISODate(),
        updated_at: date.toISODate(),
        status: "cancelled",
        departments: ["bar"],
        placed_by: { name: "some name" },
        amount: 5000
      })
      orders.push(order)

      order = await Order.query().insert({
        created_at: date.toISODate(),
        updated_at: date.toISODate(),
        status: "fulfilled",
        departments: ["kitchen"],
        placed_by: { name: "some name" },
        amount: 5000
      })
      orders.push(order)
      date = date.minus({ months: 1 })
    }
    return orders
  },

  async populateSalesItemsAndOrders() {
    let salesItems = []
    let salesItem = await SalesItem.query().insert({
      name: "heineken",
      unit: "bottle",
      price_per_unit: 2000,
      department_id: 5
    })
    salesItems.push(salesItem)
    await populateOrdersForSalesItem(salesItem, "cancelled")
    await populateOrdersForSalesItem(salesItem, "fulfilled")
    await populateOrdersForSalesItem(salesItem, "fulfilled")

    salesItem = await SalesItem.query().insert({
      name: "white rice",
      unit: "plate",
      price_per_unit: 2000,
      department_id: 3
    })
    salesItems.push(salesItem)
    await populateOrdersForSalesItem(salesItem, "cancelled")
    await populateOrdersForSalesItem(salesItem, "fulfilled")

    // this last one won't have any orders, to help test that only items with orders are returned in the query
    salesItem = await SalesItem.query().insert({
      name: "chinese rice",
      unit: "plate",
      price_per_unit: 3000,
      department_id: 8
    })
    salesItems.push(salesItem)
    return salesItems
  },

  async populateDepartmentAndOrders() {
    let departments = []

    let department = await Department.query().insert({ name: "kitchen" })
    departments.push(department)

    department = await Department.query().insert({ name: "bar" })
    departments.push(department)

    await populateOrderForDepartments(["kitchen"], "cancelled")
    await populateOrderForDepartments(["kitchen"], "cancelled")
    await populateOldOrderForDepartments(["kitchen"], "cancelled")
    await populateOrderForDepartments(["kitchen"], "pending")

    await populateOrderForDepartments(["kitchen"], "fulfilled")
    await populateOrderForDepartments(["kitchen"], "fulfilled")
    await populateOldOrderForDepartments(["kitchen"], "fulfilled")

    await populateOrderForDepartments(["bar"], "cancelled")
    await populateOrderForDepartments(["bar"], "cancelled")
    await populateOldOrderForDepartments(["bar"], "cancelled")

    await populateOrderForDepartments(["bar"], "fulfilled")
    await populateOrderForDepartments(["bar"], "fulfilled")
    await populateOldOrderForDepartments(["bar"], "fulfilled")

    await populateOrderForDepartments(["bar", "kitchen"], "cancelled")
    await populateOrderForDepartments(["bar", "kitchen"], "fulfilled")
    await populateOldOrderForDepartments(["bar", "kitchen"], "cancelled")

    return departments
  }
}

// private functions
async function populateOrdersForSalesItem(salesItem, orderStatus) {
  let order = await Order.query().insert({
    amount: 9000,
    created_at: DateTime.local().toISODate(),
    updated_at: DateTime.local().toISODate(),
    status: orderStatus,
    departments: ["kitchen"],
    placed_by: { name: "some name" }
  })
  let orderItem = await OrderItem.query().insert({
    sales_item_id: salesItem.id,
    order_id: order.id,
    quantity: 5,
    price_per_unit: salesItem.price_per_unit,
    amount: salesItem.price_per_unit * 5,
    name: salesItem.name,
    date: DateTime.local().toISODate(),
    unit: salesItem.unit
  })

  let oldOrder = await Order.query().insert({
    amount: 15000,
    created_at: DateTime.local()
      .minus({ days: 3 })
      .toISODate(),
    updated_at: DateTime.local()
      .minus({ days: 3 })
      .toISODate(),
    status: orderStatus,
    departments: ["kitchen"],
    placed_by: { name: "some name" }
  })
  let oldOrderItem = await OrderItem.query().insert({
    sales_item_id: salesItem.id,
    order_id: oldOrder.id,
    quantity: 5,
    price_per_unit: salesItem.price_per_unit,
    amount: salesItem.price_per_unit * 5,
    name: salesItem.name,
    date: DateTime.local()
      .minus({ days: 3 })
      .toISODate(),
    unit: salesItem.unit
  })
}

async function populateOrderForDepartments(departments, orderStatus) {
  let order = await Order.query().insert({
    amount: 10000,
    created_at: DateTime.local().toISODate(),
    updated_at: DateTime.local().toISODate(),
    status: orderStatus,
    departments: departments,
    placed_by: { name: "some name" }
  })
  return order
}

async function populateOldOrderForDepartments(departments, orderStatus) {
  let order = await Order.query().insert({
    amount: 10000,
    created_at: DateTime.local()
      .minus({ days: 3 })
      .toISODate(),
    updated_at: DateTime.local()
      .minus({ days: 3 })
      .toISODate(),
    status: orderStatus,
    departments: departments,
    placed_by: { name: "some name" }
  })
  return order
}
