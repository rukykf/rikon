const { DateTime } = require("luxon")
const db = require("../../../../data-access/db-config")
const DirectIssueNote = require("../../../../data-access/models/DirectIssueNote")
const { directIssueItems } = require("../TestData/direct-issue-notes.test-data")
const CreateDirectIssueNoteController = require("./CreateDirectIssueNoteController")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

afterEach(async () => {
  await DirectIssueNote.query().delete()
})

test("CreateDirectIssueNoteController.execute successfully creates new Direct Issue Note", async () => {
  let output = null
  let req = {
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
  req.get.mockReturnValue("a name")

  await CreateDirectIssueNoteController.execute(req, res)
  expect(output.items.length).toEqual(2)
  expect(output.date).toEqual(req.body.date)
  expect(output.items[0].description).toEqual("pepper")
})

test("CreateDirectIssueNoteController.execute returns error message when passed invalid items data", async () => {
  let output = null
  let req = {
    body: {
      remarks: "some remarks",
      date: DateTime.local().toISODate()
    },
    get: jest.fn()
  }
  let res = {
    json: jest.fn((args) => {
      output = args
    }),
    status: jest.fn()
  }
  res.status.mockReturnThis()
  req.get.mockReturnValue("a name")

  await CreateDirectIssueNoteController.execute(req, res)
  expect(output.messages).toEqual(["please add items to this note"])
})
