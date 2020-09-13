const _ = require("lodash")
const CreatePurchaseRequisitionNoteModel = require("../CreatePurchaseRequisitionNote/CreatePurchaseRequisitionNoteModel")

class UpdatePurchaseRequisitionNoteModel {
  constructor(req) {
    this.purchaseRequisitionNoteId = _.toNumber(req.params.id)

    this.newPurchaseRequisitionNoteDetails = new CreatePurchaseRequisitionNoteModel(req)
  }
}

module.exports = UpdatePurchaseRequisitionNoteModel
