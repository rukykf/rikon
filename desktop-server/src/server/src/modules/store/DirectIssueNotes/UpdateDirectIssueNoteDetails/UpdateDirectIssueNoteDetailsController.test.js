const db = require("../../../../data-access/db-config")
const DirectIssueNote = require("../../../../data-access/models/DirectIssueNote")
const { populateDirectIssueNote } = require("../TestData/direct-issue-notes.test-data")
const UpdateDirectIssueNoteDetailsController = require("./UpdateDirectIssueNoteDetailsController")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

afterEach(async () => {
  await DirectIssueNote.query().delete()
})

// TODO: should not update if it's inactive

test("UpdateDirectIssueNoteDetailsController.execute returns updated direct issue note after successful update", async () => {
  let directIssueNote = await populateDirectIssueNote()

  let output = null
  let req = { params: { id: directIssueNote.id }, body: { remarks: "updated remark" } }
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await UpdateDirectIssueNoteDetailsController.execute(req, res)
  expect(output.remarks).toEqual("updated remark")
})

test("UpdateDirectIssueNoteDetailsController.execute returns error message for invalid direct issue note id", async () => {
  let output = null
  let req = { params: { id: 1009 }, body: { remarks: "updated remark" } }
  let res = {
    json: jest.fn((args) => {
      output = args
    }),
    status: jest.fn()
  }

  res.status.mockReturnThis()

  await UpdateDirectIssueNoteDetailsController.execute(req, res)
  expect(output.messages).toEqual(["the selected direct issue note was not found"])
})
