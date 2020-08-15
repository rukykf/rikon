const _ = require("lodash")
const { DateTime } = require("luxon")

class DepartmentSalesBreakdownRequest {
  constructor(req) {
    this.start_date = _.has(req, ["query", "start_date"]) ? req.query.start_date : DateTime.local().toISODate()
    this.end_date = _.has(req, ["query", "end_date"]) ? req.query.end_date : DateTime.local().toISODate()
    this.department_name = _.has(req, ["query", "department_name"]) ? req.query.department_name.toLowerCase() : null
    this.department_id = _.has(req, ["query", "department_id"]) ? req.query.department_id : null
  }
}

module.exports = DepartmentSalesBreakdownRequest
