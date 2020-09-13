const { DateTime } = require("luxon")
const { transaction } = require("objection")
const CreateOpeningBalanceEntryModel = require("./CreateOpeningBalanceEntryModel")
const ValidationException = require("../../../../Exceptions/ValidationException")
const StoreLedger = require("../../../../../data-access/models/StoreLedger")
const StoreItem = require("../../../../../data-access/models/StoreItem")
const Unit = require("../../../../../data-access/models/Unit")
const StoreLedgerEntryException = require("../../StoreLedgerEntryException")

module.exports = async function CreateOpeningBalanceEntry(data) {
  let openingBalanceEntryModel = new CreateOpeningBalanceEntryModel(data)

  // check if any entry already exists for this store item...
  // it does not make sense to have an opening balance entry if there are other entries in the record

  let existingEntry = await StoreLedger.query()
    .where("store_item_id", "=", openingBalanceEntryModel.store_item_id)
    .andWhere("active", "=", 1)
    .first()

  if (existingEntry != null) {
    throw new ValidationException([
      "you cannot create an opening balance entry when there are already other entries for this store item. Revert those entries first"
    ])
  }

  // get the store item and unit
  let storeItem = await StoreItem.query()
    .findById(openingBalanceEntryModel.store_item_id)
    .withGraphFetched("receipt_unit")
    .throwIfNotFound()

  let entryUnit = await Unit.query()
    .findById(openingBalanceEntryModel.unit_id)
    .throwIfNotFound()

  // do calculations and create the entry, since this is the opening balance entry
  // most of the time the unit of the entry will be the same as the receipt unit
  let quantityInStoreItemReceiptUnit = openingBalanceEntryModel.quantity * entryUnit.conversion_to_receipt_unit

  // update the store item with the new entry and update the store ledger with the new entry
  let newLedgerEntry = null
  let updatedStoreItem = null

  try {
    const output = await transaction(StoreLedger, StoreItem, async (BoundStoreLedger, BoundStoreItem) => {
      updatedStoreItem = await BoundStoreItem.query().patchAndFetchById(storeItem.id, {
        quantity_in_receipt_unit: quantityInStoreItemReceiptUnit
      })

      newLedgerEntry = await BoundStoreLedger.query().insert({
        store_item_id: storeItem.id,
        created_by: openingBalanceEntryModel.created_by,
        entry_unit_id: entryUnit.id,
        receipt_unit_id_at_time_of_entry: storeItem.receipt_unit.id,
        entry_unit_conversion_to_receipt_unit_at_time_of_entry: entryUnit.conversion_to_receipt_unit,
        receipt_quantity: quantityInStoreItemReceiptUnit,
        date: openingBalanceEntryModel.date,
        entry_type: "opening-balance",
        created_at: DateTime.local().toISO(),
        remarks: openingBalanceEntryModel.remarks,
        balance_quantity_after_entry_in_receipt_unit: quantityInStoreItemReceiptUnit
      })
    })
  } catch (error) {
    throw new StoreLedgerEntryException([
      "something went wrong while creating an opening-balance entry for the selected store item"
    ])
  }

  return {
    newLedgerEntry: newLedgerEntry,
    updatedStoreItem: updatedStoreItem
  }
}
