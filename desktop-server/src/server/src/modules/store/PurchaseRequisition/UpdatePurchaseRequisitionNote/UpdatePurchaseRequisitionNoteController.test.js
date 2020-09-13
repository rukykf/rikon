const db = require("../../../../data-access/db-config")
const PurchaseRequisitionNote = require("../../../../data-access/models/PurchaseRequisitionNote")
const {
  populatePurchaseRequisitionNote,
  getPurchaseItems,
  clearDbAndResetData
} = require("../TestData/purchase-requisition-notes.test-data")
const UpdatePurchaseRequisitionNoteController = require("./UpdatePurchaseRequisitionNoteController")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

afterEach(async () => {
  await PurchaseRequisitionNote.query().delete()
})

test("UpdatePurchaseRequisitionNoteController successfully returns the latest purchase requisition note after purchase", async () => {
  await clearDbAndResetData()
  let purchaseItems = await getPurchaseItems()
  let oldPurchaseRequisitionNote = await populatePurchaseRequisitionNote()

  let output = null
  let req = {
    params: { id: oldPurchaseRequisitionNote.id },
    body: {
      purchase_items: purchaseItems
    },
    get: jest.fn()
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  req.get.mockReturnValue("updated name")
  await UpdatePurchaseRequisitionNoteController.execute(req, res)
  expect(output.created_by).toEqual("updated name")
  expect(output.old_purchase_requisition_notes_ids).toEqual([oldPurchaseRequisitionNote.id])
})

test("UpdatePurchaseRequisitionNoteController returns error message for note that doesn't exist", async () => {
  await clearDbAndResetData()
  let purchaseItems = await getPurchaseItems()
  let output = null
  let req = {
    params: { id: 500 },
    body: {
      purchase_items: purchaseItems
    },
    get: jest.fn()
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    }),
    status: jest.fn()
  }

  req.get.mockReturnValue("updated name")
  res.status.mockReturnThis()
  await UpdatePurchaseRequisitionNoteController.execute(req, res)
})

test("UpdatePurchaseRequisitionNoteController successfully deactivates the old requisition note", async () => {
  await clearDbAndResetData()
  let purchaseItems = await getPurchaseItems()
  let oldPurchaseRequisitionNote = await populatePurchaseRequisitionNote()

  let output = null
  let req = {
    params: { id: oldPurchaseRequisitionNote.id },
    body: {
      purchase_items: purchaseItems
    },
    get: jest.fn()
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  req.get.mockReturnValue("updated name")
  await UpdatePurchaseRequisitionNoteController.execute(req, res)
  oldPurchaseRequisitionNote = await PurchaseRequisitionNote.query().findById(oldPurchaseRequisitionNote.id)
  expect(oldPurchaseRequisitionNote.active).toEqual(0)
})
