const { DateTime } = require("luxon")
const StoreItem = require("../../../../data-access/models/StoreItem")
const Unit = require("../../../../data-access/models/Unit")
const PurchaseRequisitionNote = require("../../../../data-access/models/PurchaseRequisitionNote")

let storeItems = []
let units = []
let purchaseRequisitionNotes = []
let output = {
  storeItems: storeItems,
  units: units,
  purchaseRequisitionNotes: purchaseRequisitionNotes
}

module.exports = {
  async clearDbAndResetData() {
    await StoreItem.query().delete()
    await Unit.query().delete()
    await PurchaseRequisitionNote.query().delete()
    resetOutputData()
  },

  async getPurchaseItems() {
    await populateStoreItems()
    await populateUnitsForStoreItems()

    return [
      {
        store_item_id: storeItems[0].id,
        unit_id: units[0].id,
        current_stock_balance: 0,
        quantity_requested: 30,
        current_market_price: 1000,
        last_purchase_price: 800,
        estimated_total_cost: 30000
      },
      {
        store_item_id: storeItems[1].id,
        unit_id: units[1].id,
        current_stock_balance: 0,
        quantity_requested: 30,
        current_market_price: 1000,
        last_purchase_price: 800,
        estimated_total_cost: 30000
      }
    ]
  },

  async populatePurchaseRequisitionNote(created_at = DateTime.local().toISODate()) {
    let purchaseRequisitionNote = await PurchaseRequisitionNote.query().insert({
      created_at: created_at,
      date: created_at,
      estimated_total_cost: 60000,
      created_by: "some name"
    })

    purchaseRequisitionNotes.push(purchaseRequisitionNote)
    return purchaseRequisitionNote
  },

  async populatePurchaseRequisitionNotes() {
    // 2 recent notes
    let purchaseRequisitionNote = await PurchaseRequisitionNote.query().insert({
      created_at: DateTime.local().toISODate(),
      date: DateTime.local().toISODate(),
      estimated_total_cost: 60000,
      created_by: "some name"
    })
    purchaseRequisitionNotes.push(purchaseRequisitionNote)

    purchaseRequisitionNote = await PurchaseRequisitionNote.query().insert({
      created_at: DateTime.local().toISODate(),
      date: DateTime.local().toISODate(),
      estimated_total_cost: 600000,
      created_by: "another name"
    })
    purchaseRequisitionNotes.push(purchaseRequisitionNote)

    // 1 old note
    purchaseRequisitionNote = await PurchaseRequisitionNote.query().insert({
      created_at: DateTime.local().toISODate(),
      date: DateTime.local()
        .minus({ days: 20 })
        .toISODate(),
      estimated_total_cost: 600000,
      created_by: "another name"
    })
    purchaseRequisitionNotes.push(purchaseRequisitionNote)

    // 1 inactive note
    purchaseRequisitionNote = await PurchaseRequisitionNote.query().insert({
      created_at: DateTime.local().toISODate(),
      date: DateTime.local().toISODate(),
      estimated_total_cost: 600000,
      created_by: "another name for inactive",
      active: false
    })
    purchaseRequisitionNotes.push(purchaseRequisitionNote)

    return output
  }
}

function resetOutputData() {
  storeItems = []
  units = []
  purchaseRequisitionNotes = []
  output = {
    storeItems: storeItems,
    units: units,
    purchaseRequisitionNotes: purchaseRequisitionNotes
  }
}

async function clearDbAndResetData() {
  await StoreItem.query().delete()
  await Unit.query().delete()
  await PurchaseRequisitionNote.query().delete()
  resetOutputData()
}

async function populateStoreItems() {
  let firstStoreItem = await StoreItem.query().insert({ name: "first store item", category_id: 1 })
  storeItems.push(firstStoreItem)

  let secondStoreItem = await StoreItem.query().insert({ name: "second store item", category_id: 2 })
  storeItems.push(secondStoreItem)
}

async function populateUnitsForStoreItems() {
  let firstStoreItemMainUnit = await Unit.query().insert({ name: "main unit", store_item_id: storeItems[0].id })
  units.push(firstStoreItemMainUnit)

  let secondStoreItemMainUnit = await Unit.query().insert({ name: "main unit", store_item_id: storeItems[1].id })
  units.push(secondStoreItemMainUnit)
}
