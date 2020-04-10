const { DateTime } = require("luxon")
const faker = require("faker")

const departments = [
  { id: 1, name: "kitchen" },
  { id: 2, name: "bar" }
]

const salesItems = [
  { id: 1, name: "Coca Cola", unit: "bottle", price_per_unit: 700, department: "bar" },
  { id: 2, name: "Heineken", unit: "bottle", price_per_unit: 1200, department: "bar" },
  { id: 3, name: "Hollandia", unit: "bottle", price_per_unit: 800, department: "bar" },
  { id: 4, name: "Fanta", unit: "bottle", price_per_unit: 800, department: "bar" },
  { id: 5, name: "White Rice", unit: "portion", price_per_unit: 1000, department: "kitchen" },
  { id: 6, name: "Fried Rice", unit: "portion", price_per_unit: 1000, department: "kitchen" },
  { id: 7, name: "Turkey", unit: "portion", price_per_unit: 1000, department: "kitchen" },
  { id: 8, name: "Eba", unit: "portion", price_per_unit: 350, department: "kitchen" }
]

let cancelledOrders = []
let fulfilledOrders = []
let pendingOrders = []
let ordersCount = 1
let orderItems = []
let orderItemsCount = 1

let kitchenItems = salesItems.filter((e) => {
  return e.department === "kitchen"
})

let barItems = salesItems.filter((e) => {
  return e.department === "bar"
})

function generateKitchenOrderItems(order) {
  let num = faker.random.arrayElement([1, 2, 3, 4])
  let totalOrderAmount = 0

  for (let i = 0; i < num; i++) {
    let quantity = faker.random.arrayElement([1, 2, 3])
    let salesItem = kitchenItems[i]
    let amount = salesItem.price_per_unit * quantity
    totalOrderAmount += amount
    let newOrderItem = {
      id: orderItemsCount,
      amount: amount,
      order_id: order.id,
      sales_item_id: salesItem.id,
      quantity: quantity,
      unit: salesItem.unit,
      name: salesItem.name,
      date: order.start_date,
      price_per_unit: salesItem.price_per_unit
    }
    orderItemsCount += 1
    orderItems.push(newOrderItem)
  }
  return totalOrderAmount
}

function generateBarOrderItems(order) {
  let num = faker.random.arrayElement([1, 2, 3, 4])
  let totalOrderAmount = 0

  for (let i = 0; i < num; i++) {
    let quantity = faker.random.arrayElement([1, 2, 3])
    let salesItem = barItems[i]
    let amount = salesItem.price_per_unit * quantity
    totalOrderAmount += amount
    let newOrderItem = {
      id: orderItemsCount,
      amount: amount,
      order_id: order.id,
      sales_item_id: salesItem.id,
      quantity: quantity,
      unit: salesItem.unit,
      name: salesItem.name,
      date: order.start_date,
      price_per_unit: salesItem.price_per_unit
    }
    orderItemsCount += 1
    orderItems.push(newOrderItem)
  }
  return totalOrderAmount
}

function generateMixedOrderItems(order) {
  let num = faker.random.arrayElement([1, 2, 3, 4])
  let totalOrderAmount = 0

  for (let i = 0; i < num; i++) {
    let quantity = faker.random.arrayElement([1, 2, 3])
    let salesItem = kitchenItems[i]
    let amount = salesItem.price_per_unit * quantity
    totalOrderAmount += amount
    let newKitchenOrderItem = {
      id: orderItemsCount,
      amount: amount,
      order_id: order.id,
      sales_item_id: salesItem.id,
      quantity: quantity,
      unit: salesItem.unit,
      name: salesItem.name,
      date: order.start_date,
      price_per_unit: salesItem.price_per_unit
    }
    orderItemsCount += 1
    orderItems.push(newKitchenOrderItem)

    salesItem = barItems[i]
    amount = salesItem.price_per_unit * quantity
    totalOrderAmount += amount
    let newBarOrderItem = {
      id: orderItemsCount,
      amount: amount,
      order_id: order.id,
      sales_item_id: salesItem.id,
      quantity: quantity,
      unit: salesItem.unit,
      name: salesItem.name,
      date: order.start_date,
      price_per_unit: salesItem.price_per_unit
    }
    orderItemsCount += 1
    orderItems.push(newBarOrderItem)
  }
  return totalOrderAmount
}

function generateCancelledOrders(num) {
  for (let i = 0; i < num; i++) {
    let numDays = faker.random.arrayElement([0, 4, 30, 60])
    let newOrder = {
      id: ordersCount,
      start_date: DateTime.local()
        .minus({ days: numDays })
        .toISODate(),
      close_date: DateTime.local()
        .minus({ days: numDays })
        .toISODate(),
      status: "cancelled",
      placed_by: JSON.stringify({
        name: "Joker Haha"
      }),
      delivered_by: JSON.stringify({
        name: "Hehe Smiley"
      }),
      cancellation_remarks: "Service Delay"
    }
    let department = faker.random.arrayElement(["kitchen", "bar", "mixed"])
    if (department === "kitchen") {
      newOrder.departments = JSON.stringify({
        departments: ["kitchen"]
      })
      newOrder.amount = generateKitchenOrderItems(newOrder)
    } else if (department === "bar") {
      newOrder.departments = JSON.stringify({
        departments: ["bar"]
      })
      newOrder.amount = generateBarOrderItems(newOrder)
    } else {
      newOrder.departments = JSON.stringify({
        departments: ["kitchen", "bar"]
      })
      newOrder.amount = generateMixedOrderItems(newOrder)
    }

    ordersCount += 1
    cancelledOrders.push(newOrder)
  }
}

function generateFulfilledOrders(num) {
  for (let i = 0; i < num; i++) {
    let numDays = faker.random.arrayElement([0, 4, 30, 60])
    let newOrder = {
      id: ordersCount,
      start_date: DateTime.local()
        .minus({ days: numDays })
        .toISODate(),
      close_date: DateTime.local()
        .minus({ days: numDays })
        .toISODate(),
      status: "fulfilled",
      placed_by: JSON.stringify({
        name: "Joker Haha"
      }),
      delivered_by: JSON.stringify({
        name: "Hehe Smiley"
      })
    }
    let department = faker.random.arrayElement(["kitchen", "bar", "mixed"])
    if (department === "kitchen") {
      newOrder.departments = JSON.stringify({
        departments: ["kitchen"]
      })
      newOrder.amount = generateKitchenOrderItems(newOrder)
    } else if (department === "bar") {
      newOrder.departments = JSON.stringify({
        departments: ["bar"]
      })
      newOrder.amount = generateBarOrderItems(newOrder)
    } else {
      newOrder.departments = JSON.stringify({
        departments: ["kitchen", "bar"]
      })
      newOrder.amount = generateMixedOrderItems(newOrder)
    }

    ordersCount += 1
    fulfilledOrders.push(newOrder)
  }
}

function generatePendingOrders(num) {
  for (let i = 0; i < num; i++) {
    let numDays = faker.random.arrayElement([0, 1, 2])
    let newOrder = {
      id: ordersCount,
      start_date: DateTime.local()
        .minus({ days: numDays })
        .toISODate(),
      close_date: DateTime.local()
        .minus({ days: numDays })
        .toISODate(),
      status: "pending",
      placed_by: JSON.stringify({
        name: "Joker Haha"
      }),
      delivered_by: JSON.stringify({
        name: "Hehe Smiley"
      })
    }
    let department = faker.random.arrayElement(["kitchen", "bar", "mixed"])
    if (department === "kitchen") {
      newOrder.departments = JSON.stringify({
        departments: ["kitchen"]
      })
      newOrder.amount = generateKitchenOrderItems(newOrder)
    } else if (department === "bar") {
      newOrder.departments = JSON.stringify({
        departments: ["bar"]
      })
      newOrder.amount = generateBarOrderItems(newOrder)
    } else {
      newOrder.departments = JSON.stringify({
        departments: ["kitchen", "bar"]
      })
      newOrder.amount = generateMixedOrderItems(newOrder)
    }

    ordersCount += 1
    pendingOrders.push(newOrder)
  }
}

generateCancelledOrders(50)
generateFulfilledOrders(400)
generatePendingOrders(20)

module.exports.departments = departments
module.exports.salesItems = salesItems
module.exports.cancelledOrders = cancelledOrders
module.exports.fulfilledOrders = fulfilledOrders
module.exports.pendingOrders = pendingOrders
module.exports.orderItems = orderItems
