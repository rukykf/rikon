const { DateTime } = require("luxon")
const db = require("../../../../data-access/db-config")
const DirectIssueNote = require("../../../../data-access/models/DirectIssueNote")
const { populateDirectIssueNote, directIssueItems } = require("../TestData/direct-issue-notes.test-data")
const UpdateDirectIssueNoteController = require("./UpdateDirectIssueNoteController")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

afterEach(async () => {
  await DirectIssueNote.query().delete()
})

test("UpdateDirectIssueNoteController.execute successfully returns the latest direct issue note after update", async () => {
  let directIssueNote = await populateDirectIssueNote()

  let output = null
  let req = {
    params: { id: directIssueNote.id },
    body: {
      remarks: "some remarks",
      date: DateTime.local().toISODate(),
      items: directIssueItems
    },
    get: jest.fn()
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  req.get.mockReturnValue("some name")

  await UpdateDirectIssueNoteController.execute(req, res)
  expect(output.items.length).toEqual(2)
  expect(output.old_direct_issue_notes_ids).toEqual([directIssueNote.id])
})

test("UpdateDirectIssueNoteController.execute deactivates the old issue note", async () => {
  let directIssueNote = await populateDirectIssueNote()

  let output = null
  let req = {
    params: { id: directIssueNote.id },
    body: {
      remarks: "some remarks",
      date: DateTime.local().toISODate(),
      items: directIssueItems
    },
    get: jest.fn()
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  req.get.mockReturnValue("some name")

  await UpdateDirectIssueNoteController.execute(req, res)
  let oldDirectIssueNote = await DirectIssueNote.query().findById(directIssueNote.id)
  expect(oldDirectIssueNote.active).toEqual(0)
})

test("UpdateDirectIssueNoteController.execute returns error message for notes that don't exist", async () => {
  let output = null
  let req = {
    params: { id: 85 },
    body: {
      remarks: "some remarks",
      date: DateTime.local().toISODate(),
      items: directIssueItems
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

  await UpdateDirectIssueNoteController.execute(req, res)
  expect(output.messages).toEqual(["the selected direct issue note was not found"])
  expect(res.status).toHaveBeenLastCalledWith(400)
})
