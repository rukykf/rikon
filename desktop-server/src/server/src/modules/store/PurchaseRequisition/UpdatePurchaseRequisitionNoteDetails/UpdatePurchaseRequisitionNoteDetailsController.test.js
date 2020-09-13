const db = require("../../../../data-access/db-config")
const PurchaseRequisitionNote = require("../../../../data-access/models/PurchaseRequisitionNote")
const { populatePurchaseRequisitionNote } = require("../TestData/purchase-requisition-notes.test-data")
const UpdatePurchaseRequisitionNoteDetailsController = require("./UpdatePurchaseRequisitionNoteDetailsController")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

afterEach(async () => {
  await PurchaseRequisitionNote.query().delete()
})

test("UpdatePurchaseRequisitionNoteDetailsController returns the updated purchase requisition note after successful update", async () => {
  let purchaseRequisitionNote = await populatePurchaseRequisitionNote()
  let output = null
  let req = {
    params: { id: purchaseRequisitionNote.id },
    body: {
      remarks: "a remark for purchase note"
    }
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await UpdatePurchaseRequisitionNoteDetailsController.execute(req, res)
  expect(output.remarks).toEqual("a remark for purchase note")
})

test("UpdatePurchaseRequisitionNoteDetailsController returns error message for invalid purchase requisition note id", async () => {
  let output = null
  let req = {
    params: { id: 500 },
    body: {
      remarks: "a remark for purchase note"
    }
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    }),
    status: jest.fn()
  }

  res.status.mockReturnThis()
  await UpdatePurchaseRequisitionNoteDetailsController.execute(req, res)
  expect(output.messages).toEqual(["the selected purchase requisition note was not found"])
})

test("UpdatePurchaseRequisitionNoteDetailsController returns error message for invalid request data", async () => {
  let purchaseRequisitionNote = await populatePurchaseRequisitionNote()
  let output = null
  let req = {
    params: { id: purchaseRequisitionNote.id },
    body: {
      remarks: 7
    }
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    }),
    status: jest.fn()
  }

  res.status.mockReturnThis()
  await UpdatePurchaseRequisitionNoteDetailsController.execute(req, res)
  expect(output.messages).toEqual(["ensure the data provided is in the correct format"])
})
