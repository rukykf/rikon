const { DateTime } = require("luxon")
const _ = require("lodash")
const ValidationException = require("../../../../Exceptions/ValidationException")

class CreateOpeningBalanceEntryModel {
  constructor(data) {
    this.date = DateTime.local().toISO()
    this.remarks = ""

    if (!_.has(data, ["quantity"])) {
      throw new ValidationException(["the quantity of the opening balance entry is required"])
    }

    if (!_.has(data, ["unit_id"])) {
      throw new ValidationException(["the unit of the opening balance entry is required"])
    }

    if (!_.has(data, ["created_by"])) {
      throw new ValidationException(["the name of whoever is creating this entry is required"])
    }

    if (!_.has(data, ["store_item_id"])) {
      throw new ValidationException(["the store item for this entry is required"])
    }

    if (_.has(data, ["date"])) {
      this.date = data.date
    }

    if (_.has(data, ["remarks"])) {
      this.remarks = data.remarks
    }

    this.quantity = data.quantity
    this.unit_id = data.unit_id
    this.created_by = data.created_by
    this.store_item_id = data.store_item_id
  }
}

module.exports = CreateOpeningBalanceEntryModel
