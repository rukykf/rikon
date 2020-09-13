const { DateTime } = require("luxon")
const DirectIssueNote = require("../../../../data-access/models/DirectIssueNote")

module.exports = {
  directIssueItems: [
    {
      description: "pepper",
      quantityReceived: 3,
      remark: null,
      totalValue: 8000,
      unitOfMeasurement: null,
      unitPrice: null
    },
    {
      description: "chicken",
      quantityReceived: 3,
      remark: null,
      totalValue: 6000,
      unitOfMeasurement: "kg",
      unitPrice: 2000
    }
  ],

  async populateDirectIssueNote(created_at = DateTime.local().toISODate()) {
    let directIssueNote = await DirectIssueNote.query().insert({
      created_at: created_at,
      date: DateTime.local().toISODate(),
      remarks: "some remark",
      created_by: "some name",
      items: [
        {
          description: "pepper",
          quantityReceived: 3,
          remark: null,
          totalValue: 8000,
          unitOfMeasurement: null,
          unitPrice: null
        },
        {
          description: "chicken",
          quantityReceived: 3,
          remark: null,
          totalValue: 6000,
          unitOfMeasurement: "kg",
          unitPrice: 2000
        }
      ]
    })

    return directIssueNote
  },

  async populateDirectIssueNotes() {
    let directIssueNotes = []
    let items = [
      {
        description: "pepper",
        quantityReceived: 3,
        remark: null,
        totalValue: 8000,
        unitOfMeasurement: null,
        unitPrice: null
      },
      {
        description: "chicken",
        quantityReceived: 3,
        remark: null,
        totalValue: 6000,
        unitOfMeasurement: "kg",
        unitPrice: 2000
      }
    ]

    // populate with 2 recent notes i.e within the past 7 days
    let directIssueNote = await DirectIssueNote.query().insert({
      created_at: DateTime.local().toISODate(),
      date: DateTime.local().toISODate(),
      remarks: "some remark",
      created_by: "some name",
      items: items
    })
    directIssueNotes.push(directIssueNote)

    directIssueNote = await DirectIssueNote.query().insert({
      created_at: DateTime.local().toISODate(),
      date: DateTime.local().toISODate(),
      remarks: "another remark",
      created_by: "another name",
      items: items
    })
    directIssueNotes.push(directIssueNote)

    // populate with 1 inactive note
    directIssueNote = await DirectIssueNote.query().insert({
      created_at: DateTime.local().toISODate(),
      date: DateTime.local().toISODate(),
      remarks: "another remark",
      created_by: "another name",
      items: items,
      active: false
    })
    directIssueNotes.push(directIssueNote)

    // populate with 1 old note - the date a note is for is different from the date the note's entry was recorded (created_at)
    directIssueNote = await DirectIssueNote.query().insert({
      created_at: DateTime.local().toISODate(),
      date: DateTime.local()
        .minus({ days: 20 })
        .toISODate(),
      remarks: "another remark",
      created_by: "another name",
      items: items
    })
    directIssueNotes.push(directIssueNote)

    return directIssueNotes
  }
}
