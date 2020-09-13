const { DateTime } = require("luxon")
const StoreLedger = require("../../../../../../data-access/models/StoreLedger")
const StoreItem = require("../../../../../../data-access/models/StoreItem")
const Unit = require("../../../../../../data-access/models/Unit")

let units = []
let storeLedgerEntries = []
let storeItems = []
let output = {
  units: units,
  storeLedgerEntries: storeLedgerEntries,
  storeItems: storeItems
}

module.exports = {
  async populateStoreItemAndUnits() {
    let storeItem = await StoreItem.query().insert({
      name: "Generic Detergent",
      category_id: 10
    })
    storeItems.push(storeItem)

    let receiptUnit = await Unit.query().insert({
      name: "Bag",
      store_item_id: storeItem.id,
      conversion_to_receipt_unit: 1,
      is_receipt_unit: true
    })
    units.push(receiptUnit)

    let issueUnit = await Unit.query().insert({
      name: "Bowl",
      store_item_id: storeItem.id,
      conversion_to_receipt_unit: 0.25,
      is_issue_unit: true
    })
    units.push(issueUnit)

    return output
  },

  async populateStoreItemAndUnitsWithOpeningEntry() {
    let storeItem = await StoreItem.query().insert({
      name: "Generic Detergent",
      category_id: 10,
      quantity_in_receipt_unit: 50
    })
    storeItems.push(storeItem)

    let receiptUnit = await Unit.query().insert({
      name: "Bag",
      store_item_id: storeItem.id,
      conversion_to_receipt_unit: 1,
      is_receipt_unit: true
    })
    units.push(receiptUnit)

    let issueUnit = await Unit.query().insert({
      name: "Bowl",
      store_item_id: storeItem.id,
      conversion_to_receipt_unit: 0.25,
      is_issue_unit: true
    })
    units.push(issueUnit)

    let openingBalanceEntry = await StoreLedger.query().insert({
      store_item_id: storeItem.id,
      created_by: "store keeper",
      entry_unit_id: receiptUnit.id,
      receipt_unit_id_at_time_of_entry: receiptUnit.id,
      entry_unit_conversion_to_receipt_unit_at_time_of_entry: 1,
      receipt_quantity: 50,
      date: DateTime.local().toISODate(),
      entry_type: "opening-balance",
      created_at: DateTime.local().toISO(),
      balance_quantity_after_entry_in_receipt_unit: 50
    })
    storeLedgerEntries.push(openingBalanceEntry)

    return output
  },

  async clearDBAndResetData() {
    await StoreLedger.query().delete()
    await StoreItem.query().delete()
    await Unit.query().delete()
    resetOutput()
  }
}

function resetOutput() {
  units = []
  storeLedgerEntries = []
  storeItems = []
  output = {
    units: units,
    storeLedgerEntries: storeLedgerEntries,
    storeItems: storeItems
  }
}
