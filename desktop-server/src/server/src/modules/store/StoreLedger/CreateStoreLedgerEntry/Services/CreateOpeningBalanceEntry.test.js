const db = require("../../../../../data-access/db-config")
const { NotFoundError } = require("objection")
const ValidationException = require("../../../../Exceptions/ValidationException")
const CreateOpeningBalanceEntry = require("./CreateOpeningBalanceEntry")
const {
  populateStoreItemAndUnits,
  clearDBAndResetData,
  populateStoreItemAndUnitsWithOpeningEntry
} = require("./TestData/store-ledger.test-data")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

afterEach(async () => {
  await clearDBAndResetData()
})

test("CreateOpeningBalanceEntry successfully returns the new opening-balance entry and the updated store item", async () => {
  let { storeItems, units } = await populateStoreItemAndUnits()

  let data = {
    quantity: 4,
    unit_id: units[0].id,
    created_by: "store keeper",
    store_item_id: storeItems[0].id
  }

  let { newLedgerEntry, updatedStoreItem } = await CreateOpeningBalanceEntry(data)
  expect(updatedStoreItem.quantity_in_receipt_unit).toEqual(4)
  expect(newLedgerEntry.receipt_quantity).toEqual(4)
  expect(newLedgerEntry.entry_type).toEqual("opening-balance")
  expect(newLedgerEntry.entry_unit_id).toEqual(units[0].id)
  expect(newLedgerEntry.entry_unit_conversion_to_receipt_unit_at_time_of_entry).toEqual(
    units[0].conversion_to_receipt_unit
  )
  expect(newLedgerEntry.balance_quantity_after_entry_in_receipt_unit).toEqual(4)
})

test("CreateOpeningBalanceEntry throws exception when attempting to create an opening balance entry with existing entries for the store item", async () => {
  let { storeItems, units } = await populateStoreItemAndUnitsWithOpeningEntry()

  let data = {
    quantity: 4,
    unit_id: units[0].id,
    created_by: "store keeper",
    store_item_id: storeItems[0].id
  }

  expect(CreateOpeningBalanceEntry(data)).rejects.toEqual(
    new ValidationException([
      "you cannot create an opening balance entry when there are already other entries for this store item. Revert those entries first"
    ])
  )
})

test("CreateOpeningBalanceEntry throws exceptions when passed invalid models", async () => {
  expect(CreateOpeningBalanceEntry({})).rejects.toEqual(
    new ValidationException(["the quantity of the opening balance entry is required"])
  )

  expect(CreateOpeningBalanceEntry({ quantity: 4 })).rejects.toEqual(
    new ValidationException(["the unit of the opening balance entry is required"])
  )
})

test("CreateOpeningBalanceEntry throws exceptions when passed records that don't exist", async () => {
  let data = {
    quantity: 4,
    unit_id: 1,
    created_by: "store keeper",
    store_item_id: 1
  }

  expect(CreateOpeningBalanceEntry(data)).rejects.toEqual(new NotFoundError())
})
