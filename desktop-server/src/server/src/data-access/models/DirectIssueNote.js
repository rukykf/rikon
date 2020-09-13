const { DateTime } = require("luxon")
const Objection = require("../objection-config")
const GetUniqueIdentifierForObject = require("../../utils/GetUniqueIdentifierForObject")

class DirectIssueNote extends Objection {
  static get tableName() {
    return "direct_issue_notes"
  }

  static get virtualAttributes() {
    return ["unique_id"]
  }

  // eslint-disable-next-line camelcase
  unique_id() {
    return GetUniqueIdentifierForObject("RDIN", this.id, this.created_at)
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["items"],
      properties: {
        id: { type: "integer" },
        items: { type: "array" },
        active: { type: "boolean" },
        old_direct_issue_notes_ids: { type: "array" },
        created_by: { type: "string" },
        remarks: { type: "string" },
        serial_no: { type: "string" }
      }
    }
  }

  $beforeInsert(queryContext) {
    if (this.created_at == null) {
      this.created_at = DateTime.local().toISO()
    }

    this.updated_at = DateTime.local().toISO()
    super.$beforeInsert(queryContext)
  }

  $beforeUpdate(opt, queryContext) {
    this.updated_at = DateTime.local().toISO()
    super.$beforeUpdate(opt, queryContext)
  }
}

module.exports = DirectIssueNote
