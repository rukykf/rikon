const { NotFoundError } = require("objection")
const { DateTime, Interval } = require("luxon")
const PurchaseRequisitionNote = require("../../../../data-access/models/PurchaseRequisitionNote")
const DeletePurchaseRequisitionNoteModel = require("./DeletePurchaseRequisitionNoteModel")

module.exports = {
  async execute(req, res) {
    try {
      let request = new DeletePurchaseRequisitionNoteModel(req)

      let purchaseRequisitionNote = await PurchaseRequisitionNote.query()
        .findById(request.purchaseRequisitionNoteId)
        .throwIfNotFound()

      let interval = Interval.fromDateTimes(
        DateTime.fromISO(purchaseRequisitionNote.created_at),
        DateTime.local().plus({ days: 1 })
      )

      if (interval.length("days") > 180) {
        return res
          .status(400)
          .json({ messages: ["you cannot delete a purchase requisition that was created more than 180 days ago"] })
      }

      await PurchaseRequisitionNote.query()
        .findById(request.purchaseRequisitionNoteId)
        .patch({ active: false })

      return res.json({ messages: ["successfully deleted the selected purchase requisition note"] })
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not find the selected purchase requisition note"] })
      }

      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  }
}
