const { DateTime, Interval } = require("luxon")
const Objection = require("../objection-config")

class Booking extends Objection {
  static get tableName() {
    return "bookings"
  }

  static get virtualAttributes() {
    return ["num_nights", "amount_due"]
  }

  static getNumNights(startDateISO, endDateISO) {
    let startDate = DateTime.fromISO(startDateISO)
    let endDate = DateTime.fromISO(endDateISO)

    let nights = Interval.fromDateTimes(startDate, endDate)
    if (nights.length("days") < 1) {
      return 1
    }
    return nights.length("days")
  }

  // eslint-disable-next-line camelcase
  num_nights() {
    return Booking.getNumNights(this.start_date, this.end_date)
  }

  // eslint-disable-next-line camelcase
  amount_due() {
    return this.num_nights() * this.price_per_night
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["room_id", "start_date", "price_per_night", "customer_details"],
      properties: {
        id: { type: "integer" },
        room_id: { type: "integer" },
        start_date: { type: "string", transform: ["trim"] },
        end_date: { type: "string", transform: ["trim"] },
        customer_details: { type: "object" },
        price_per_night: { type: "number" },
        status: { type: "string", enum: ["open", "closed", "cancelled"] }
      }
    }
  }

  static get relationMappings() {
    const Room = require("./Room")
    const Sale = require("./Sale")

    return {
      room: {
        relation: Objection.BelongsToOneRelation,
        modelClass: Room,
        join: {
          from: "bookings.room_id",
          to: "rooms.id"
        }
      },
      sale: {
        relation: Objection.HasOneRelation,
        modelClass: Sale,
        filter(builder) {
          builder.where("sellable_type", "booking")
        },
        beforeInsert(model) {
          model.sellable_type = "booking"
        },
        join: {
          from: "bookings.id",
          to: "sales.sellable_id"
        }
      }
    }
  }

  $beforeInsert(queryContext) {
    // booking timestamps need to store the time
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

module.exports = Booking
