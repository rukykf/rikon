const _ = require("lodash")

class UpdatePurchaseRequisitionNoteDetailsModel {
  constructor(req) {
    this.id = _.toNumber(req.params.id)

    if (_.has(req, ["body", "remarks"])) {
      this.remarks = req.body.remarks
    }

    if (_.has(req, ["body", "serial_no"])) {
      this.serial_no = req.body.serial_no
    }

    if (_.has(req, ["body", "date"])) {
      this.date = req.body.date
    }
  }
}

module.exports = UpdatePurchaseRequisitionNoteDetailsModel
