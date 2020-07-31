const _ = require("lodash")
const ValidationException = require("../../Exceptions/ValidationException")

/**
 * @typedef {Object} ItemDetails
 * @property {number} sales_item_id
 * @property {number} quantity
 */

class CreateOrderRequestModel {
  constructor(req) {
    if (!_.has(req, ["body", "item_details"])) {
      throw new ValidationException(["The item_details property is required for this endpoint"])
    }

    if (!_.has(req, ["body", "destination"])) {
      throw new ValidationException(["The destination property is required for this endpoint"])
    }

    /**
     * @param {Array<ItemDetails>}
     */
    this.itemDetails = req.body.item_details

    this.placedBy = { name: `${req.get("first_name")} ${req.get("last_name")}` }
    this.destination = _.get(req, ["body", "destination"])
  }
}

module.exports = CreateOrderRequestModel
