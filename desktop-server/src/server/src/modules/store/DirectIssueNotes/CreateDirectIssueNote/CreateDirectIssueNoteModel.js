const _ = require("lodash")
const { DateTime } = require("luxon")
const DirectIssueNoteItemModel = require("../DirectIssueNoteItemModel")
const ValidationException = require("../../../Exceptions/ValidationException")

class CreateDirectIssueNoteModel {
  constructor(req) {
    this.date = DateTime.local().toISODate()
    this.created_by = req.get("full_name")

    if (_.has(req, ["body", "remarks"])) {
      this.remarks = req.body.remarks
    }

    if (_.has(req, ["body", "date"])) {
      this.date = req.body.date
    }

    if (_.has(req, ["body", "serial_no"])) {
      this.serial_no = req.body.serial_no
    }

    if (!_.has(req, ["body", "items"]) || req.body.items.length < 1) {
      throw new ValidationException(["please add items to this note"])
    }

    this.items = []
    let sum = 0

    req.body.items.forEach((item) => {
      let issueNoteItem = new DirectIssueNoteItemModel()
      issueNoteItem.description = item.description
      issueNoteItem.quantityReceived = item.quantityReceived
      issueNoteItem.remark = item.remark
      issueNoteItem.totalValue = item.totalValue
      issueNoteItem.unitOfMeasurement = item.unitOfMeasurement
      issueNoteItem.unitPrice = item.unitPrice
      sum += item.totalValue
      this.items.push(issueNoteItem)
    })

    this.total = sum
    if (_.has(req, ["body", "total"])) {
      this.total = req.body.total
    }
  }
}

module.exports = CreateDirectIssueNoteModel
