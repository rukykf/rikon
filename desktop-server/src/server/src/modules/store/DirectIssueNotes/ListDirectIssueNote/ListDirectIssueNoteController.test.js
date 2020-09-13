const { DateTime } = require("luxon")
const db = require("../../../../data-access/db-config")
const DirectIssueNote = require("../../../../data-access/models/DirectIssueNote")
const ListDirectIssueNoteController = require("./ListDirectIssueNoteController")
const { populateDirectIssueNotes } = require("../TestData/direct-issue-notes.test-data")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

afterEach(async () => {
  await DirectIssueNote.query().delete()
})

test("ListDirectIssueNoteController.execute successfully lists all direct issue notes", async () => {
  let directIssueNotes = await populateDirectIssueNotes()

  let output = null
  let req = {}
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await ListDirectIssueNoteController.execute(req, res)
  expect(output.length).toEqual(2)
  expect(output[0].remarks).toEqual("some remark")
  expect(output[1].remarks).toEqual("another remark")
})

test("ListDirectIssueNoteController.execute successfully filters list by date", async () => {
  let directIssueNotes = await populateDirectIssueNotes()

  let output = null
  let req = {
    query: {
      start_date: DateTime.local()
        .minus({ days: 30 })
        .toISODate(),
      end_date: DateTime.local()
        .minus({ days: 10 })
        .toISODate()
    }
  }

  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await ListDirectIssueNoteController.execute(req, res)
  expect(output.length).toEqual(1)
  expect(output[0].remarks).toEqual("another remark")
})
