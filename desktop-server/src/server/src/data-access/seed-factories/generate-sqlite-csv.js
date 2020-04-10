const fs = require("fs")

const {
  departments,
  salesItems,
  cancelledOrders,
  fulfilledOrders,
  pendingOrders,
  orderItems
} = require("./departments-sales-items-orders")

const { rooms, openBookings, closedBookings, reservations, roomTypes } = require("./rooms-bookings-reservations-types")
const { users, roles } = require("./users-roles")
const { sales, salesTransactions } = require("./sales-transactions")

let orders = cancelledOrders.concat(fulfilledOrders).concat(pendingOrders)
let bookings = openBookings.concat(closedBookings)

let orderItemsJSON = JSON.stringify(orderItems, null, 1)
let departmentsJSON = JSON.stringify(departments, null, 1)
let salesItemsJSON = JSON.stringify(salesItems, null, 1)
let bookingsJSON = JSON.stringify(bookings)
let ordersJSON = JSON.stringify(orders)
let roomsJSON = JSON.stringify(rooms)
let reservationsJSON = JSON.stringify(reservations)
let roomTypesJSON = JSON.stringify(roomTypes)
let usersJSON = JSON.stringify(users)
let rolesJSON = JSON.stringify(roles)
let salesJSON = JSON.stringify(sales)
let salesTransactionsJSON = JSON.stringify(salesTransactions)

fs.writeFile("./generated/order-items.json", orderItemsJSON, function(err) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.")
    return console.log(err)
  }

  console.log("JSON file has been saved.")
})

fs.writeFile("./generated/departments.json", departmentsJSON, function(err) {
  if (err) {
    console.log("Could not write to file")
  }
  console.log("JSON file has been saved")
})

fs.writeFile("./generated/sales-items.json", salesItemsJSON, function(err) {
  if (err) {
    console.log("Could not write to file")
  }
  console.log("JSON file has been saved")
})

fs.writeFile("./generated/bookings.json", bookingsJSON, function(err) {
  if (err) {
    console.log("Could not write to file")
  }
  console.log("JSON file has been saved")
})

fs.writeFile("./generated/orders.json", ordersJSON, function(err) {
  if (err) {
    console.log("Could not write to file")
  }
  console.log("JSON file has been saved")
})

fs.writeFile("./generated/departments.json", departmentsJSON, function(err) {
  if (err) {
    console.log("Could not write to file")
  }
  console.log("JSON file has been saved")
})

fs.writeFile("./generated/rooms.json", roomsJSON, function(err) {
  if (err) {
    console.log("Could not write to file")
  }
  console.log("JSON file has been saved")
})

fs.writeFile("./generated/reservations.json", reservationsJSON, function(err) {
  if (err) {
    console.log("Could not write to file")
  }
  console.log("JSON file has been saved")
})

fs.writeFile("./generated/room-types.json", roomTypesJSON, function(err) {
  if (err) {
    console.log("Could not write to file")
  }
  console.log("JSON file has been saved")
})

fs.writeFile("./generated/users.json", usersJSON, function(err) {
  if (err) {
    console.log("Could not write to file")
  }
  console.log("JSON file has been saved")
})

fs.writeFile("./generated/roles.json", rolesJSON, function(err) {
  if (err) {
    console.log("Could not write to file")
  }
  console.log("JSON file has been saved")
})

fs.writeFile("./generated/sales.json", salesJSON, function(err) {
  if (err) {
    console.log("Could not write to file")
  }
  console.log("JSON file has been saved")
})

fs.writeFile("./generated/sales-transactions.json", salesTransactionsJSON, function(err) {
  if (err) {
    console.log("Could not write to file")
  }
  console.log("JSON file has been saved")
})
