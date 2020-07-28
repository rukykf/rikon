const _ = require("lodash")
const { DateTime } = require("luxon")

class ManagementListTransactionsIndexRequestModel {
  constructor(req) {
    this.start_date = DateTime.local()
      .minus({ days: 90 })
      .toISODate()
    this.end_date = DateTime.local().toISODate()

    if (_.has(req, ["query", "start_date"])) {
      this.start_date = req.query.start_date
    }

    if (_.has(req, ["query", "end_date"])) {
      this.end_date = req.query.end_date
    }

    if (_.has(req, ["query", "management_list_item_id"])) {
      this.management_list_item_id = req.query.management_list_item_id
    }

    if (_.has(req, ["query", "management_list_name"])) {
      this.management_list_name = req.query.management_list_name
    }

    if (_.has(req, ["query", "sales_status"])) {
      this.sales_status = req.query.sales_status
    }
  }
}

module.exports = ManagementListTransactionsIndexRequestModel
