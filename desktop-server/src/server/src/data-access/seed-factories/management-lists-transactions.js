const { DateTime } = require("luxon")
const { salesCount: initialCount } = require("./sales-transactions")

const managementListItems = [
  { id: 1, full_name: "MD Authorizer", list_name: "authorized_to_authorize", active: 1 },
  { id: 2, full_name: "Festus Washington", list_name: "authorized_to_authorize", active: 1 },
  { id: 3, full_name: "Hon. AJ", list_name: "authorized_for_complementary", active: 1 },
  { id: 4, full_name: "Hon. Talib", list_name: "authorized_for_complementary", active: 1 },
  { id: 5, full_name: "Bros Discount", list_name: "authorized_for_discounts", active: 1 },
  { id: 6, full_name: "Pastor Phil", list_name: "authorized_for_discounts", active: 1 },
  { id: 7, full_name: "Adventure Works", list_name: "authorized_company", active: 1 },
  { id: 8, full_name: "LONEB Co.", list_name: "authorized_company", active: 1 }
]

const managementListTransactions = []
const managementTransactionSales = []

let salesCount = initialCount + 1
let managementListTransactionsCount = 1

function generateManagementTransactions(managementListItemId, num, saleType = "complementary") {
  let salesIds = []

  // generate sales and associate them with a person from the managementList
  for (let i = 0; i < num; i++) {
    let sale = generateSale(saleType)
    let managementListTransaction = {
      id: managementListTransactionsCount,
      sales_id: sale.id,
      management_list_item_id: managementListItemId,
      created_at: DateTime.local().toISODate()
    }

    managementListTransactionsCount += 1
    managementListTransactions.push(managementListTransaction)
    salesIds.push(sale.id)
  }

  // associate the sales with an authorizer through another set of transactions
  salesIds.forEach((saleId) => {
    let managementListTransaction = {
      id: managementListTransactionsCount,
      sales_id: saleId,
      management_list_item_id: 1, // Festus Washington has an ID of 1
      created_at: DateTime.local().toISODate()
    }

    managementListTransactionsCount += 1
    managementListTransactions.push(managementListTransaction)
  })
}

function generateSale(saleType = "complementary") {
  if (saleType === "complementary") {
    return generateComplementarySale()
  }

  if (saleType === "owing") {
    return generateOwingSale()
  }

  return generateDiscountSale()
}

function generateComplementarySale() {
  let sale = {
    id: salesCount,
    total_amount: 10000,
    total_paid: 0,
    total_complementary: 10000,
    total_due: 0,
    sellable_id: 1,
    sellable_type: "booking",
    status: "paid",
    customer_details: JSON.stringify({ name: "some name" }),
    credit_authorized_by: JSON.stringify({ name: "Festus Washington" })
  }
  salesCount += 1
  managementTransactionSales.push(sale)
  return sale
}

function generateDiscountSale() {
  let sale = {
    id: salesCount,
    total_amount: 10000,
    total_paid: 8000,
    total_complementary: 2000,
    total_due: 0,
    sellable_id: 1,
    sellable_type: "order",
    status: "paid",
    customer_details: JSON.stringify({ name: "some name" }),
    credit_authorized_by: JSON.stringify({ name: "Festus Washington" })
  }
  salesCount += 1
  managementTransactionSales.push(sale)
  return sale
}

function generateOwingSale() {
  let sale = {
    id: salesCount,
    total_amount: 10000,
    total_paid: 0,
    total_complementary: 0,
    total_due: 10000,
    sellable_id: 1,
    sellable_type: "order",
    status: "paid",
    customer_details: JSON.stringify({ name: "some name" }),
    credit_authorized_by: JSON.stringify({ name: "Festus Washington" })
  }
  salesCount += 1
  managementTransactionSales.push(sale)
  return sale
}

let idsForComplementaryTransactions = [3, 4]
idsForComplementaryTransactions.forEach((id) => {
  generateManagementTransactions(id, 100)
})

let idsForDiscountTransactions = [5]
idsForDiscountTransactions.forEach((id) => {
  generateManagementTransactions(id, 100, "discount")
})

let idsForCompanyDebt = [7, 8]
idsForCompanyDebt.forEach((id) => {
  generateManagementTransactions(id, 100, "owing")
})

module.exports.transactionSales = managementTransactionSales
module.exports.managementListItems = managementListItems
module.exports.managementListTransactions = managementListTransactions
