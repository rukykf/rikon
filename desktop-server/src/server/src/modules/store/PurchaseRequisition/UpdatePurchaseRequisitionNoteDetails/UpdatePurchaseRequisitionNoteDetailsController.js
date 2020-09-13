const { NotFoundError, ValidationError } = require("objection")
const PurchaseRequisitionNote = require("../../../../data-access/models/PurchaseRequisitionNote")
const UpdatePurchaseRequisitionNoteDetailsModel = require("./UpdatePurchaseRequisitionNoteDetailsModel")

module.exports = {
  async execute(req, res) {
    try {
      let request = new UpdatePurchaseRequisitionNoteDetailsModel(req)

      let updatedPurchaseRequisitionNoteDetails = await PurchaseRequisitionNote.query()
        .patchAndFetchById(request.id, request)
        .withGraphFetched("purchase_items.unit")
        .withGraphFetched("purchase_items.store_item")
        .throwIfNotFound()

      return res.json(updatedPurchaseRequisitionNoteDetails)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["the selected purchase requisition note was not found"] })
      }

      if (error instanceof ValidationError) {
        return res.status(400).json({ messages: ["ensure the data provided is in the correct format"] })
      }

      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  }
}
