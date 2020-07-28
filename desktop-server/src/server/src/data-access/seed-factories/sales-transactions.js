const faker = require("faker")
const { fulfilledOrders } = require("./departments-sales-items-orders")
const { closedBookings, openBookings } = require("./rooms-bookings-reservations-types")
const Booking = require("../models/Booking")

let salesBookings = JSON.parse(JSON.stringify(closedBookings))

let sales = []
let salesTransactions = []
let salesCount = 1
let salesTransactionsCount = 1
let saleTypeIndex = 0

let salesTypes = [
  "partial-complementary",
  "partial-payment-complementary",
  "full-payment",
  "full-payment",
  "full-payment",
  "full-payment",
  "full-payment",
  "full-complementary",
  "full-credit"
]

function generateFullPaymentSale(sellable, type) {
  let newSalesTransaction = {
    id: salesTransactionsCount,
    sales_id: salesCount,
    date: sellable.created_at,
    transaction_type: faker.random.arrayElement(["cash", "pos"]),
    amount: sellable.amount,
    registered_by: "Rukky Kofi"
  }
  let newSale = {
    id: salesCount,
    created_at: sellable.created_at,
    updated_at: sellable.created_at,
    total_amount: sellable.amount,
    total_paid: sellable.amount,
    total_due: 0,
    total_complementary: 0,
    sellable_id: sellable.id,
    sellable_type: type,
    status: "paid"
  }
  sales.push(newSale)
  salesTransactions.push(newSalesTransaction)
  salesCount += 1
  salesTransactionsCount += 1
}

function generateFullComplementarySale(sellable, type) {
  let newSalesTransaction = {
    id: salesTransactionsCount,
    sales_id: salesCount,
    date: sellable.created_at,
    transaction_type: "complementary",
    amount: sellable.amount,
    registered_by: "Rukky Kofi"
  }
  let newSale = {
    id: salesCount,
    created_at: sellable.created_at,
    updated_at: sellable.created_at,
    total_amount: sellable.amount,
    total_paid: 0,
    total_due: 0,
    total_complementary: sellable.amount,
    sellable_id: sellable.id,
    sellable_type: type,
    status: "paid",
    customer_details: JSON.stringify({
      name: "Rukky Kofi",
      room_no: "101"
    }),
    credit_authorized_by: JSON.stringify({ name: "Rukky Kofi" })
  }
  sales.push(newSale)
  salesTransactions.push(newSalesTransaction)
  salesCount += 1
  salesTransactionsCount += 1
}

function generateFullCreditSale(sellable, type) {
  let newSale = {
    id: salesCount,
    created_at: sellable.created_at,
    updated_at: sellable.created_at,
    total_amount: sellable.amount,
    total_paid: 0,
    total_due: sellable.amount,
    total_complementary: 0,
    sellable_id: sellable.id,
    sellable_type: type,
    status: "owing",
    customer_details: JSON.stringify({
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      room_no: "113"
    }),
    credit_authorized_by: JSON.stringify({ name: "Rukky Kofi" })
  }
  sales.push(newSale)
  salesCount += 1
}

function generatePartialComplementarySale(sellable, type) {
  let discountAmount = Math.floor(sellable.amount / 3)
  let newSalesTransaction = {
    id: salesTransactionsCount,
    sales_id: salesCount,
    date: sellable.created_at,
    transaction_type: "discount",
    amount: discountAmount,
    registered_by: "Rukky Kofi"
  }
  let newSale = {
    id: salesCount,
    created_at: sellable.created_at,
    updated_at: sellable.created_at,
    total_amount: sellable.amount,
    total_paid: 0,
    total_due: sellable.amount - discountAmount,
    total_complementary: discountAmount,
    sellable_id: sellable.id,
    sellable_type: type,
    status: "owing",
    customer_details: JSON.stringify({
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      room_no: "114"
    }),
    credit_authorized_by: JSON.stringify({ name: "Rukky Kofi" })
  }
  sales.push(newSale)
  salesTransactions.push(newSalesTransaction)
  salesCount += 1
  salesTransactionsCount += 1
}

function generatePartialPaymentComplementarySale(sellable, type) {
  let transactionAmount = Math.floor(sellable.amount / 3)
  let newSalesTransaction = {
    id: salesTransactionsCount,
    sales_id: salesCount,
    date: sellable.created_at,
    transaction_type: "discount",
    amount: transactionAmount,
    registered_by: "Rukky Kofi"
  }
  salesTransactions.push(newSalesTransaction)
  salesTransactionsCount += 1

  newSalesTransaction = {
    id: salesTransactionsCount,
    sales_id: salesCount,
    date: sellable.created_at,
    transaction_type: faker.random.arrayElement(["cash", "pos"]),
    amount: transactionAmount,
    registered_by: "Rukky Kofi"
  }
  salesTransactions.push(newSalesTransaction)
  salesTransactionsCount += 1

  let newSale = {
    id: salesCount,
    created_at: sellable.created_at,
    updated_at: sellable.created_at,
    total_amount: sellable.amount,
    total_paid: transactionAmount,
    total_due: sellable.amount - 2 * transactionAmount,
    total_complementary: transactionAmount,
    sellable_id: sellable.id,
    sellable_type: type,
    status: "owing",
    customer_details: JSON.stringify({
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      room_no: "114"
    }),
    credit_authorized_by: JSON.stringify({ name: "Rukky Kofi" })
  }

  sales.push(newSale)
  salesCount += 1
}

function getSaleType() {
  let saleType = salesTypes[saleTypeIndex]
  saleTypeIndex += 1
  if (saleTypeIndex >= salesTypes.length) {
    saleTypeIndex = 0
  }
  return saleType
}

fulfilledOrders.forEach((order) => {
  let saleType = getSaleType()
  if (saleType === "partial-complementary") {
    generatePartialComplementarySale(order, "order")
  }
  if (saleType === "partial-payment-complementary") {
    generatePartialPaymentComplementarySale(order, "order")
  }
  if (saleType === "full-payment") {
    generateFullPaymentSale(order, "order")
  }
  if (saleType === "full-complementary") {
    generateFullComplementarySale(order, "order")
  }
  if (saleType === "full-credit") {
    generateFullCreditSale(order, "order")
  }
})

salesBookings.forEach((booking) => {
  booking.amount = booking.price_per_night * Booking.getNumNights(booking.start_date, booking.end_date)
  let saleType = getSaleType()
  if (saleType === "partial-complementary") {
    generatePartialComplementarySale(booking, "booking")
  }
  if (saleType === "partial-payment-complementary") {
    generatePartialPaymentComplementarySale(booking, "booking")
  }
  if (saleType === "full-payment") {
    generateFullPaymentSale(booking, "booking")
  }
  if (saleType === "full-complementary") {
    generateFullComplementarySale(booking, "booking")
  }
  if (saleType === "full-credit") {
    generateFullCreditSale(booking, "booking")
  }
})

let openBookingSaleType = "full-payment"

function getOpenBookingSaleType() {
  if (openBookingSaleType === "full-payment") {
    openBookingSaleType = "partial-payment-complementary"
  } else {
    openBookingSaleType = "full-payment"
  }
  return openBookingSaleType
}

salesBookings = JSON.parse(JSON.stringify(openBookings))
salesBookings.forEach((booking) => {
  booking.amount = booking.price_per_night * Booking.getNumNights(booking.start_date, booking.end_date)
  let saleType = getOpenBookingSaleType()

  if (saleType === "partial-payment-complementary") {
    generatePartialPaymentComplementarySale(booking, "booking")
  }
  if (saleType === "full-payment") {
    generateFullPaymentSale(booking, "booking")
  }
})

module.exports.sales = sales
module.exports.salesTransactions = salesTransactions
module.exports.salesCount = salesCount
