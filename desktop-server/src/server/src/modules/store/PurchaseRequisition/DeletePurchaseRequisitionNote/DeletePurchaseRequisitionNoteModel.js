const _ = require("lodash")

class DeletePurchaseRequisitionNoteModel {
  constructor(req) {
    this.purchaseRequisitionNoteId = _.toNumber(req.params.id)
  }
}

module.exports = DeletePurchaseRequisitionNoteModel
