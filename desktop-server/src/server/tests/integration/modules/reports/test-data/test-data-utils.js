const { DateTime } = require("luxon")
const Order = require("../../../../../src/data-access/models/Order")
const SalesItem = require("../../../../../src/data-access/models/SalesItem")
const Sale = require("../../../../../src/data-access/models/Sale")
const Department = require("../../../../../src/data-access/models/Department")
const OrderItem = require("../../../../../src/data-access/models/OrderItem")
const Booking = require("../../../../../src/data-access/models/Booking")
const SalesTransaction = require("../../../../../src/data-access/models/SalesTransaction")

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
        department_id: 1,
        transaction_type: "cash",
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
        department_id: 1,
        transaction_type: "cash",
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
  },

  async populateDepartmentsBookingsAndOrders() {
    // populate booking sales
    let cashBooking = await populateBooking(4000)
    await populateSaleAndSalesTransactions("booking", cashBooking.id, 4000, "cash")

    let transferBooking = await populateBooking(3000)
    await populateSaleAndSalesTransactions("booking", transferBooking.id, 3000, "transfer")

    let posBooking = await populateBooking(5000)
    await populateSaleAndSalesTransactions("booking", posBooking.id, 5000, "pos")

    // populate kitchen order sales
    let kitchenCashOrder = await populateOrderForDepartments(["kitchen"], "fulfilled")
    await populateSaleAndSalesTransactions("order", kitchenCashOrder.id, 4000, "cash")

    let kitchenTransferOrder = await populateOrderForDepartments(["kitchen"], "fulfilled")
    await populateSaleAndSalesTransactions("order", kitchenTransferOrder.id, 3000, "transfer")

    let kitchenPOSOrder = await populateOrderForDepartments(["kitchen"], "fulfilled")
    await populateSaleAndSalesTransactions("order", kitchenPOSOrder.id, 5000, "pos")

    // populate bar order sales
    let barCashOrder = await populateOrderForDepartments(["bar"], "fulfilled")
    await populateSaleAndSalesTransactions("order", barCashOrder.id, 4000, "cash")

    let barTransferOrder = await populateOrderForDepartments(["bar"], "fulfilled")
    await populateSaleAndSalesTransactions("order", barTransferOrder.id, 3000, "transfer")

    let barPOSOrder = await populateOrderForDepartments(["bar"], "fulfilled")
    await populateSaleAndSalesTransactions("order", barPOSOrder.id, 5000, "pos")

    // another set of transactions for the order to see if the query is considering cancelled orders
    barCashOrder = await populateOrderForDepartments(["bar"], "cancelled")
    await populateSaleAndSalesTransactions("order", barCashOrder.id, 4000, "cash")

    barTransferOrder = await populateOrderForDepartments(["bar"], "cancelled")
    await populateSaleAndSalesTransactions("order", barTransferOrder.id, 3000, "transfer")

    barPOSOrder = await populateOrderForDepartments(["bar"], "cancelled")
    await populateSaleAndSalesTransactions("order", barPOSOrder.id, 5000, "pos")

    // another set of transactions for the order to see if the query is considering cancelled orders
    barCashOrder = await populateOrderForDepartments(["bar"], "pending")
    await populateSaleAndSalesTransactions("order", barCashOrder.id, 4000, "cash")

    barTransferOrder = await populateOrderForDepartments(["bar"], "pending")
    await populateSaleAndSalesTransactions("order", barTransferOrder.id, 3000, "transfer")

    barPOSOrder = await populateOrderForDepartments(["bar"], "pending")
    await populateSaleAndSalesTransactions("order", barPOSOrder.id, 5000, "pos")
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

async function populateSaleAndSalesTransactions(sellableType, sellableId, amount, paymentMethod) {
  let sale = await Sale.query().insert({
    total_amount: amount,
    total_paid: amount,
    total_complementary: 0,
    total_due: 0,
    sellable_id: sellableId,
    department_id: 1,
    transaction_type: "cash",
    sellable_type: sellableType,
    status: "paid"
  })

  await SalesTransaction.query().insert({
    sales_id: sale.id,
    date: DateTime.local().toISODate(),
    transaction_type: paymentMethod,
    amount: amount,
    registered_by: "name"
  })

  // an inactive transaction to check that the queries are only working on active sales transactions
  await SalesTransaction.query().insert({
    sales_id: sale.id,
    date: DateTime.local().toISODate(),
    transaction_type: paymentMethod,
    amount: amount,
    active: false,
    registered_by: "name"
  })
}

async function populateBooking(amount) {
  let booking = await Booking.query().insert({
    created_at: DateTime.local().toISODate(),
    updated_at: DateTime.local().toISODate(),
    start_date: DateTime.local().toISODate(),
    end_date: DateTime.local().toISODate(),
    price_per_night: amount,
    room_id: 3,
    customer_details: { name: "some name" },
    status: "closed"
  })
  return booking
}

async function populateDebtSale(sellableType, sellableId, amount) {
  let sale = await Sale.query().insert({
    total_amount: amount,
    total_paid: 0,
    total_complementary: 0,
    total_due: amount,
    department_id: 1,
    transaction_type: "cash",
    sellable_id: sellableId,
    sellable_type: sellableType,
    status: "owing"
  })
}
