const db = require("../../../../data-access/db-config")
const PurchaseRequisitionNote = require("../../../../data-access/models/PurchaseRequisitionNote")
const CreatePurchaseRequisitionNoteController = require("./CreatePurchaseRequisitionNoteController")
const { getPurchaseItems } = require("../TestData/purchase-requisition-notes.test-data")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

afterEach(async () => {
  await PurchaseRequisitionNote.query().delete()
})

test("CreatePurchaseRequisitionNoteController.execute returns new purchase requisition note after successful creation", async () => {
  let purchaseItemsData = await getPurchaseItems()
  let output = null
  let req = {
    body: {
      purchase_items: purchaseItemsData
    },
    get: jest.fn()
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  req.get.mockReturnValue("some name")
  await CreatePurchaseRequisitionNoteController.execute(req, res)
  expect(output.purchase_items.length).toEqual(2)
  expect(output.purchase_items[0].unit_id).toEqual(purchaseItemsData[0].unit_id)
})

test("CreatePurchaseRequisitionNoteController.execute returns error message when ValidationException is thrown", async () => {
  let output = null
  let req = {
    body: {},
    get: jest.fn()
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    }),
    status: jest.fn()
  }

  req.get.mockReturnValue("some name")
  res.status.mockReturnThis()
  await CreatePurchaseRequisitionNoteController.execute(req, res)
  expect(output.messages).toEqual(["you need to provide the purchase_items for this note"])
})

test("CreatePurhcaseRequisitionNoteController.execute returns error message when ValidationError is thrown", async () => {
  let output = null
  let req = {
    body: {
      purchase_items: [{ unit_id: "some invalid id" }]
    },
    get: jest.fn()
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    }),
    status: jest.fn()
  }

  req.get.mockReturnValue("some name")
  res.status.mockReturnThis()
  await CreatePurchaseRequisitionNoteController.execute(req, res)
  expect(output.messages).toEqual(["ensure that the data provided is in the valid data type and that it is complete"])
})
