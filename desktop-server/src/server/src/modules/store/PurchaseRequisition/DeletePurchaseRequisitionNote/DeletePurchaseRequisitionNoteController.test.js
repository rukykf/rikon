const { DateTime } = require("luxon")
const db = require("../../../../data-access/db-config")
const PurchaseRequisitionNote = require("../../../../data-access/models/PurchaseRequisitionNote")
const DeletePurchaseRequisitionNoteController = require("./DeletePurchaseRequisitionNoteController")
const { populatePurchaseRequisitionNote } = require("../TestData/purchase-requisition-notes.test-data")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

afterEach(async () => {
  await PurchaseRequisitionNote.query().delete()
})

test("DeletePurchaseRequisitionNoteController.execute successfully deletes existing purchase requisition note", async () => {
  let purchaseRequisitionNote = await populatePurchaseRequisitionNote()
  let output = null
  let req = {
    params: { id: purchaseRequisitionNote.id }
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await DeletePurchaseRequisitionNoteController.execute(req, res)
  expect(output.messages).toEqual(["successfully deleted the selected purchase requisition note"])
})

test("DeletePurchaseRequisitionNoteController.execute returns error message when attempting to delete a note that doesn't exist", async () => {
  let output = null
  let req = {
    params: { id: 98 }
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    }),
    status: jest.fn()
  }

  res.status.mockReturnThis()

  await DeletePurchaseRequisitionNoteController.execute(req, res)
  expect(output.messages).toEqual(["could not find the selected purchase requisition note"])
  expect(res.status).toHaveBeenLastCalledWith(400)
})

test("DeletePurchaseRequisitionNoteController.execute returns error message when attempting to delete a note that was created more than 180 days ago", async () => {
  let purchaseRequisitionNote = await populatePurchaseRequisitionNote(
    DateTime.local()
      .minus({ days: 200 })
      .toISODate()
  )
  let output = null
  let req = {
    params: { id: purchaseRequisitionNote.id }
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    }),
    status: jest.fn()
  }

  res.status.mockReturnThis()
  await DeletePurchaseRequisitionNoteController.execute(req, res)
  expect(output.messages).toEqual(["you cannot delete a purchase requisition that was created more than 180 days ago"])
  expect(res.status).toHaveBeenLastCalledWith(400)
})
