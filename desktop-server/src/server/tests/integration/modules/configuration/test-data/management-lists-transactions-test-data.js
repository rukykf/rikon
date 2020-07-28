const { DateTime } = require("luxon")
const ManagementListTransaction = require("../../../../../src/data-access/models/ManagementListTransaction")
const ManagementList = require("../../../../../src/data-access/models/ManagementList")
const Sale = require("../../../../../src/data-access/models/Sale")

let managementListItems = []
let managementListTransactionItems = []
let sales = []
let output = {
  sales: sales,
  managementListTransactionItems: managementListTransactionItems,
  managementListItems: managementListItems
}

module.exports = {
  async populateSale(salesStatus = "paid") {
    let sale = await Sale.query().insert({
      total_amount: 5000,
      total_paid: 5000,
      total_complementary: 0,
      total_due: 0,
      sellable_id: 2,
      sellable_type: "booking",
      status: salesStatus,
      customer_details: { name: "some name" }
    })
    sales.push(sale)
    return sale
  },

  async populateManagementListTransactionsData() {
    resetData()

    await populateManagementListData()

    for (let i = 0; i < managementListItems.length; i++) {
      // populate with 2 paid sales
      let item = managementListItems[i]
      let sale = await this.populateSale("paid")
      await populateManagementListTransaction(sale.id, item.id)

      sale = await this.populateSale("paid")
      await populateManagementListTransaction(sale.id, item.id)

      // populate with 1 owing sale
      sale = await this.populateSale("owing")
      await populateManagementListTransaction(sale.id, item.id)

      // populate with 1 old sale
      sale = await this.populateSale("paid")
      await populateManagementListTransaction(
        sale.id,
        item.id,
        DateTime.local()
          .minus({ days: 100 })
          .toISODate()
      )
    }

    return output
  },

  async populateManagementListTransactionItemData() {
    resetData()

    await populateManagementListData()

    let item = managementListItems[0]
    let sale = await this.populateSale("paid")
    let transaction = await populateManagementListTransaction(sale.id, item.id)

    return transaction
  },

  async deleteAllDataFromDB() {
    await Sale.query().delete()
    await ManagementList.query().delete()
    await ManagementListTransaction.query().delete()
  }
}

function resetData() {
  sales = []
  managementListItems = []
  managementListTransactionItems = []
  output = {
    sales: sales,
    managementListTransactionItems: managementListTransactionItems,
    managementListItems: managementListItems
  }
}

async function populateManagementListTransaction(saleId, managementListItemId, date = DateTime.local().toISODate()) {
  let transaction = await ManagementListTransaction.query().insert({
    management_list_item_id: managementListItemId,
    sales_id: saleId,
    created_at: date
  })

  managementListTransactionItems.push(transaction)
  return transaction
}

async function populateManagementListData() {
  let authorizer = await ManagementList.query().insert({
    full_name: "Authorized Authorizer",
    list_name: "authorized_to_authorize"
  })
  managementListItems.push(authorizer)

  let discountPerson = await ManagementList.query().insert({
    full_name: "Discount Person",
    list_name: "authorized_for_discounts"
  })
  managementListItems.push(discountPerson)

  let complementaryPerson = await ManagementList.query().insert({
    full_name: "Complementary Person",
    list_name: "authorized_for_complementary"
  })
  managementListItems.push(complementaryPerson)

  let companyPerson = await ManagementList.query().insert({
    full_name: "Company Person",
    list_name: "authorized_company"
  })
  managementListItems.push(companyPerson)
}
