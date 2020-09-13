const { NotFoundError, ValidationError } = require("objection")
const ValidationException = require("../../../Exceptions/ValidationException")
const UpdatePurchaseRequisitionNoteModel = require("./UpdatePurchaseRequisitionNoteModel")
const PurchaseRequisitionNote = require("../../../../data-access/models/PurchaseRequisitionNote")

module.exports = {
  async execute(req, res) {
    try {
      let request = new UpdatePurchaseRequisitionNoteModel(req)

      let oldPurchaseRequisitionNote = await PurchaseRequisitionNote.query()
        .findById(request.purchaseRequisitionNoteId)
        .throwIfNotFound()

      if (request.newPurchaseRequisitionNoteDetails.remarks == null) {
        request.newPurchaseRequisitionNoteDetails.remarks = oldPurchaseRequisitionNote.remarks
      }

      if (request.newPurchaseRequisitionNoteDetails.serial_no == null) {
        request.newPurchaseRequisitionNoteDetails.serial_no = oldPurchaseRequisitionNote.serial_no
      }

      if (request.newPurchaseRequisitionNoteDetails.date == null) {
        request.newPurchaseRequisitionNoteDetails.date = oldPurchaseRequisitionNote.date
      }

      let oldPurchaseRequisitionNoteIds = oldPurchaseRequisitionNote.old_purchase_requisition_notes_ids

      if (oldPurchaseRequisitionNoteIds == null) {
        oldPurchaseRequisitionNoteIds = []
      }

      oldPurchaseRequisitionNoteIds.push(oldPurchaseRequisitionNote.id)

      let newPurchaseRequisitionNote = await PurchaseRequisitionNote.query().insert(
        request.newPurchaseRequisitionNoteDetails
      )

      // deactivate the old note
      await PurchaseRequisitionNote.query()
        .findById(oldPurchaseRequisitionNote.id)
        .patch({ active: false })

      // update the new note with the old note's id
      newPurchaseRequisitionNote = await PurchaseRequisitionNote.query().patchAndFetchById(
        newPurchaseRequisitionNote.id,
        {
          old_purchase_requisition_notes_ids: oldPurchaseRequisitionNoteIds
        }
      )

      return res.json(newPurchaseRequisitionNote)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["the selected purchase requisition note was not found"] })
      }

      if (error instanceof ValidationError) {
        return res.status(400).json({ messages: ["ensure the data provided is in the correct format"] })
      }

      if (error instanceof ValidationException) {
        return res.status(400).json({ messages: error.messages })
      }

      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  }
}
