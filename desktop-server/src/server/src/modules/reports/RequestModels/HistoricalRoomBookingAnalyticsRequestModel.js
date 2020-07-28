const _ = require("lodash")
const { DateTime } = require("luxon")

module.exports = class HistoricalRoomBookingAnalyticsRequestModel {
  constructor(req) {
    this.start_date = _.has(req, ["query", "start_date"])
      ? req.query.start_date
      : DateTime.local()
          .minus({ days: 90 })
          .toISODate()
    this.end_date = _.has(req, ["query", "end_date"]) ? req.query.end_date : DateTime.local().toISODate()
  }
}
