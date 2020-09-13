const _ = require("lodash")

class ShowPurchaseRequisitionNotesModel {
  constructor(req) {
    this.selectedPurchaseRequisitionNoteIds = []

    if (_.has(req, ["body", "selectedIds"])) {
      this.selectedPurchaseRequisitionNoteIds = req.body.selectedIds
    }
  }
}

module.exports = ShowPurchaseRequisitionNotesModel
