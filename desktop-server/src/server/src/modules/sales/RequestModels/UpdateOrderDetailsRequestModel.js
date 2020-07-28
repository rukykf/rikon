const { DateTime } = require("luxon")
const _ = require("lodash")

module.exports = class UpdateOrderDetailsRequestModel {
  constructor(req) {
    if (_.has(req, ["body", "status"])) {
      this.status = _.get(req, ["body", "status"])
    }

    if (_.has(req, ["body", "cancellation_remarks"])) {
      this.cancellation_remarks = _.get(req, ["body", "cancellation_remarks"])
    }

    if (_.has(req, ["body", "delivered_by"])) {
      this.delivered_by = _.get(req, ["body", "delivered_by"])
    }

    if (_.has(req, ["body", "placed_by"])) {
      this.placed_by = _.get(req, ["body", "placed_by"])
    }

    if (_.has(req, ["body", "docket_serial_no"])) {
      this.docket_serial_no = _.get(req, ["body", "docket_serial_no"])
    }

    this.updated_at = DateTime.local().toISO()
  }
}
