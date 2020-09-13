const db = require("../../../../data-access/db-config")
const DirectIssueNote = require("../../../../data-access/models/DirectIssueNote")
const { populateDirectIssueNotes } = require("../TestData/direct-issue-notes.test-data")
const ShowDirectIssueNoteController = require("./ShowDirectIssueNoteController")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

afterEach(async () => {
  await DirectIssueNote.query().delete()
})

test("ShowDirectIssueNoteController.execute successfully returns details of the selected direct issue notes", async () => {
  let directIssueNotes = await populateDirectIssueNotes()

  let output = null
  let req = {
    body: { selectedIds: [directIssueNotes[0].id, directIssueNotes[1].id, directIssueNotes[2].id] }
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await ShowDirectIssueNoteController.execute(req, res)

  expect(output.length).toEqual(3)
})

test("ShowDirectIssueNoteController.execute returns error message when passed invalid id", async () => {
  let directIssueNotes = await populateDirectIssueNotes()

  let output = null
  let req = {
    body: { selectedIds: [1002] }
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    }),
    status: jest.fn()
  }

  res.status.mockReturnThis()

  await ShowDirectIssueNoteController.execute(req, res)

  expect(output.messages).toEqual(["some of the selected direct issue notes could not be found"])
  expect(res.status).toHaveBeenLastCalledWith(400)
})
