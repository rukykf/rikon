const db = require("../../../../data-access/db-config")
const PurchaseRequisitionNote = require("../../../../data-access/models/PurchaseRequisitionNote")
const { populatePurchaseRequisitionNotes } = require("../TestData/purchase-requisition-notes.test-data")
const ShowPurchaseRequisitionNotesController = require("./ShowPurchaseRequisitionNotesController")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

afterEach(async () => {
  await PurchaseRequisitionNote.query().delete()
})

test("ShowPurchaseRequisitionNotesController successfully returns corresponding notes for selected ids", async () => {
  let { purchaseRequisitionNotes } = await populatePurchaseRequisitionNotes()
  let output = null
  let req = {
    body: {
      selectedIds: [purchaseRequisitionNotes[0].id, purchaseRequisitionNotes[1].id, purchaseRequisitionNotes[2].id]
    }
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await ShowPurchaseRequisitionNotesController.execute(req, res)
  expect(output.length).toEqual(3)
  expect(output[0].created_by).toEqual("some name")
})

test("ShowPurchaseRequisitionNotesController returns error message when passed invalid id", async () => {
  let output = null
  let req = {
    query: {
      selectedIds: [500]
    }
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    }),
    status: jest.fn()
  }

  res.status.mockReturnThis()

  await ShowPurchaseRequisitionNotesController.execute(req, res)
  expect(output.messages).toEqual(["could not find some of the selected purchase requisition notes"])
  expect(res.status).toHaveBeenLastCalledWith(400)
})
