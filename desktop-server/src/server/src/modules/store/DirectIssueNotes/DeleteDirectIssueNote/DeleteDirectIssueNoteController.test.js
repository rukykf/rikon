const { DateTime } = require("luxon")
const db = require("../../../../data-access/db-config")
const DirectIssueNote = require("../../../../data-access/models/DirectIssueNote")
const DeleteDirectIssueNoteController = require("./DeleteDirectIssueNoteController")
const { populateDirectIssueNote } = require("../TestData/direct-issue-notes.test-data")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

afterEach(async () => {
  await DirectIssueNote.query().delete()
})

test("DeleteDirectIssueNoteController.execute successfully deletes existing direct issue note", async () => {
  let directIssueNote = await populateDirectIssueNote()

  let output = null
  let req = { params: { id: directIssueNote.id } }
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await DeleteDirectIssueNoteController.execute(req, res)
  expect(output.messages).toEqual(["successfully deleted the selected direct issue note"])
})

test("DeleteDirectIssueNoteController.execute returns error message when attempting to delete a note that doesn't exist", async () => {
  let output = null
  let req = { params: { id: 500 } }
  let res = {
    json: jest.fn((args) => {
      output = args
    }),
    status: jest.fn()
  }

  res.status.mockReturnThis()
  await DeleteDirectIssueNoteController.execute(req, res)
  expect(output.messages).toEqual(["could not find the selected direct issue note"])
  expect(res.status).toHaveBeenLastCalledWith(400)
})

test("DeleteDirectIssueNoteController.execute returns error message when attempting to delete note that was created more than 180 days ago", async () => {
  let directIssueNote = await populateDirectIssueNote(
    DateTime.local()
      .minus({ days: 200 })
      .toISODate()
  )

  let output = null
  let req = { params: { id: directIssueNote.id } }
  let res = {
    json: jest.fn((args) => {
      output = args
    }),
    status: jest.fn()
  }

  res.status.mockReturnThis()
  await DeleteDirectIssueNoteController.execute(req, res)
  expect(output.messages).toEqual(["you cannot delete an issue note that was created more than 180 days ago"])
  expect(res.status).toHaveBeenLastCalledWith(400)
})
