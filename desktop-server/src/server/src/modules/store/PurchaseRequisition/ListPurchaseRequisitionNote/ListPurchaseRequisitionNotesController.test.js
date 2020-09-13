const { DateTime } = require("luxon")
const db = require("../../../../data-access/db-config")
const PurchaseRequisitionNote = require("../../../../data-access/models/PurchaseRequisitionNote")
const ListPurchaseRequisitionNotesController = require("./ListPurchaseRequisitionNotesController")
const { populatePurchaseRequisitionNotes } = require("../TestData/purchase-requisition-notes.test-data")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

afterEach(async () => {
  await PurchaseRequisitionNote.query().delete()
})

test("ListPurchaseRequisitionNotesController returns list of all available purchase requisition notes", async () => {
  await populatePurchaseRequisitionNotes()
  let output = null
  let req = {}
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await ListPurchaseRequisitionNotesController.execute(req, res)
  expect(output.length).toEqual(3)
  expect(output[0].created_by).toEqual("some name")
  expect(output[1].created_by).toEqual("another name")
})

test("ListPurchaseRequisitionNotesController filters list by date", async () => {
  await populatePurchaseRequisitionNotes()
  let output = null
  let req = {
    query: {
      start_date: DateTime.local()
        .minus({ days: 30 })
        .toISODate(),
      end_date: DateTime.local()
        .minus({ days: 15 })
        .toISODate()
    }
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await ListPurchaseRequisitionNotesController.execute(req, res)
  expect(output.length).toEqual(1)
  expect(output[0].created_by).toEqual("another name")
})

test("ListPurchaseRequisitionNotesController filters list by active", async () => {
  await populatePurchaseRequisitionNotes()
  let output = null
  let req = {
    query: {
      active: 0
    }
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await ListPurchaseRequisitionNotesController.execute(req, res)
  expect(output.length).toEqual(1)
  expect(output[0].created_by).toEqual("another name for inactive")
})
