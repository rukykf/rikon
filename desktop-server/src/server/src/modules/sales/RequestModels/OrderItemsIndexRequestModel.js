const _ = require("lodash")
const { DateTime } = require("luxon")

class OrderItemsIndexRequestModel {
  constructor(req) {
    this.start_date = DateTime.local()
      .minus({ days: 90 })
      .toISODate()
    this.end_date = DateTime.local().toISODate()
    this.department_id = null
    this.status = null

    if (_.has(req, ["query", "start_date"])) {
      this.start_date = req.query.start_date
    }

    if (_.has(req, ["query", "end_date"])) {
      this.end_date = req.query.end_date
    }

    if (_.has(req, ["query", "department_id"])) {
      this.department_id = _.toNumber(req.query.department_id)
    }

    if (_.has(req, ["query", "status"])) {
      this.status = req.query.status
    }
  }
}

module.exports = OrderItemsIndexRequestModel
