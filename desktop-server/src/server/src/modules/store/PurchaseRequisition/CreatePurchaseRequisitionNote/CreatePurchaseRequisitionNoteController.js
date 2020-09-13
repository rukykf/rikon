const { ValidationError } = require("objection")
const ValidationException = require("../../../Exceptions/ValidationException")
const CreatePurchaseRequisitionNoteModel = require("./CreatePurchaseRequisitionNoteModel")
const PurchaseRequisitionNote = require("../../../../data-access/models/PurchaseRequisitionNote")

module.exports = {
  async execute(req, res) {
    try {
      let requestModel = new CreatePurchaseRequisitionNoteModel(req)

      let purchaseRequisitionNote = await PurchaseRequisitionNote.query().insertGraphAndFetch(requestModel)

      return res.json(purchaseRequisitionNote)
    } catch (error) {
      if (error instanceof ValidationException) {
        return res.status(400).json({ messages: error.messages })
      }

      if (error instanceof ValidationError) {
        return res
          .status(400)
          .json({ messages: ["ensure that the data provided is in the valid data type and that it is complete"] })
      }

      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  }
}
