const PurchaseRequisitionNote = require("../../../../data-access/models/PurchaseRequisitionNote")
const ListPurchaseRequisitionNotesModel = require("./ListPurchaseRequisitionNotesModel")

module.exports = {
  async execute(req, res) {
    try {
      let request = new ListPurchaseRequisitionNotesModel(req)

      let purchaseRequisitionNotesQueryBuilder = PurchaseRequisitionNote.query()
        .where("purchase_requisition_notes.date", ">=", request.startDate)
        .andWhere("purchase_requisition_notes.date", "<=", request.endDate)
        .withGraphJoined("purchase_items.unit")
        .withGraphJoined("purchase_items.store_item")

      if (request.active !== null) {
        purchaseRequisitionNotesQueryBuilder.andWhere("purchase_requisition_notes.active", "=", request.active)
      }

      let purchaseRequisitionNotes = await purchaseRequisitionNotesQueryBuilder.execute()
      return res.json(purchaseRequisitionNotes)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  }
}
