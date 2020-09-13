const { NotFoundError } = require("objection")
const PurchaseRequisitionNote = require("../../../../data-access/models/PurchaseRequisitionNote")
const ShowPurchaseRequisitionNotesModel = require("./ShowPurchaseRequisitionNotesModel")

module.exports = {
  async execute(req, res) {
    try {
      let request = new ShowPurchaseRequisitionNotesModel(req)

      let purchaseRequisitionNotes = await PurchaseRequisitionNote.query()
        .findByIds(request.selectedPurchaseRequisitionNoteIds)
        .throwIfNotFound()

      return res.json(purchaseRequisitionNotes)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not find some of the selected purchase requisition notes"] })
      }

      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  }
}
