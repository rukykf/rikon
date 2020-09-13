const _ = require("lodash")
const { DateTime } = require("luxon")
const ValidationException = require("../../../Exceptions/ValidationException")
const PurchaseItemModel = require("../PurchaseItemModel")

class CreatePurchaseRequisitionNoteModel {
  constructor(req) {
    this.date = DateTime.local().toISODate()
    this.created_by = req.get("full_name")

    if (_.has(req, ["body", "remarks"])) {
      this.remarks = req.body.remarks
    }

    if (_.has(req, ["body", "serial_no"])) {
      this.serial_no = req.body.serial_no
    }

    if (_.has(req, ["body", "date"])) {
      this.date = req.body.date
    }

    let sum = 0
    if (!_.has(req, ["body", "purchase_items"]) || req.body.purchase_items.length < 1) {
      throw new ValidationException(["you need to provide the purchase_items for this note"])
    }

    this.purchase_items = []

    req.body.purchase_items.forEach((item) => {
      let purchaseItem = new PurchaseItemModel()
      purchaseItem.date = this.date
      purchaseItem.store_item_id = item.store_item_id
      purchaseItem.unit_id = item.unit_id
      purchaseItem.current_stock_balance = item.current_stock_balance
      purchaseItem.quantity_requested = item.quantity_requested
      purchaseItem.current_market_price = item.current_market_price
      purchaseItem.last_purchase_price = item.last_purchase_price
      purchaseItem.estimated_total_cost = item.estimated_total_cost
      purchaseItem.remarks = item.remarks

      sum += item.estimated_total_cost
      this.purchase_items.push(purchaseItem)
    })

    this.estimated_total_cost = sum

    if (_.has(req, ["body", "estimated_total_cost"])) {
      this.estimated_total_cost = req.body.estimated_total_cost
    }
  }
}

module.exports = CreatePurchaseRequisitionNoteModel
