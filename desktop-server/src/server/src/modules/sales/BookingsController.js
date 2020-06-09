const _ = require("lodash")
const { DateTime } = require("luxon")
const { NotFoundError, ValidationError } = require("objection")
const Booking = require("../../data-access/models/Booking")
const Room = require("../../data-access/models/Room")
const Sale = require("../../data-access/models/Sale")

module.exports = {
  async index(req, res) {
    try {
      let startDate = _.get(req, ["query", "start_date"])
        ? req.query.start_date
        : DateTime.local()
            .minus({ days: 90 })
            .toISODate()
      let endDate = _.get(req, ["query", "end_date"]) ? req.query.end_date : DateTime.local().toISODate()

      let bookingsQueryBuilder = Booking.query()
        .where("created_at", ">=", startDate)
        .andWhere("created_at", "<=", endDate)
        .withGraphFetched("room")
        .withGraphFetched("sale")

      if (_.get(req, ["query", "status"]) != null) {
        bookingsQueryBuilder.where("status", "=", req.query.status)
      }

      let bookings = await bookingsQueryBuilder
      return res.json(bookings)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async createBookingForRoom(req, res) {
    try {
      // check if this room is already booked
      let existingBooking = await Booking.query()
        .where("room_id", "=", _.toNumber(req.params.id))
        .andWhere("status", "=", "open")
        .first()
      if (existingBooking != null) {
        return res.status(400).json({ messages: ["this room is already booked"] })
      }

      let room = await Room.query()
        .findById(_.toNumber(req.params.id))
        .withGraphFetched("room_type")
        .throwIfNotFound()

      let booking = await Booking.query().insert({
        room_id: _.toNumber(req.params.id),
        start_date: DateTime.local().toISODate(),
        end_date: DateTime.local().toISODate(),
        customer_details: _.get(req, ["body", "customer_details"]),
        price_per_night: room.room_type.price_per_night,
        status: "open"
      })
      return res.json(booking)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["invalid room id"] })
      }

      if (error instanceof ValidationError) {
        return res.status(400).json({ messages: ["invalid customer data"] })
      }

      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  },

  async getCurrentBookingForRoom(req, res) {
    try {
      await Booking.query()
        .where("room_id", "=", _.toNumber(req.params.id))
        .andWhere("status", "=", "open")
        .patch({
          end_date: DateTime.local().toISODate()
        })

      let currentBooking = await Booking.query()
        .where("room_id", "=", _.toNumber(req.params.id))
        .andWhere("status", "=", "open")
        .withGraphFetched("sale")
        .first()
      return res.json(currentBooking)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async getBookingsForRoom(req, res) {
    try {
      let bookings = await Booking.query().where("room_id", "=", _.toNumber(req.params.id))
      return res.json(bookings)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async closeBooking(req, res) {
    try {
      let booking = await Booking.query()
        .patchAndFetchById(_.toNumber(req.params.id), {
          end_date: DateTime.local().toISODate()
        })
        .withGraphFetched("sale")
        .throwIfNotFound()

      if (booking.status !== "open") {
        return res.status(400).json({ messages: ["you are trying to close a booking that's already closed"] })
      }

      if (booking.sale == null) {
        return res.status(400).json({ messages: ["you cannot close the booking without making full payment"] })
      }

      // update the amount due for this booking in its sale record
      let numberOfNights = Booking.getNumNights(booking.start_date, booking.end_date)
      let newTotalAmount = numberOfNights * booking.price_per_night
      let newTotalDue = newTotalAmount - (booking.sale.total_paid + booking.sale.total_complementary)

      let sale = await Sale.query().patchAndFetchById(booking.sale.id, {
        total_amount: newTotalAmount,
        total_due: newTotalDue,
        status: newTotalDue <= 0 ? "paid" : "owing"
      })

      // check that either the booking has been fully paid or a credit transaction has been recorded
      if (sale.total_amount !== sale.total_paid && sale.customer_details == null) {
        return res.status(400).json({ messages: ["you cannot close the booking without making full payment"] })
      }

      // update the status of the booking to closed
      booking = await Booking.query().patchAndFetchById(_.toNumber(req.params.id), {
        status: "closed"
      })
      return res.json(booking)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["invalid booking id"] })
      }
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async cancelBooking(req, res) {
    try {
      // update the status of the booking to cancelled
      let booking = await Booking.query()
        .patchAndFetchById(_.toNumber(req.params.id), {
          status: "cancelled"
        })
        .throwIfNotFound()
      return res.json({ messages: ["successfully cancelled booking"] })
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["invalid booing id"] })
      }

      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async updateCustomerDetailsForBooking(req, res) {
    try {
      // update the status of the booking to cancelled
      let booking = await Booking.query()
        .patchAndFetchById(_.toNumber(req.params.id), {
          customer_details: _.get(req, ["body", "customer_details"])
        })
        .throwIfNotFound()
      return res.json(booking)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["invalid booing id"] })
      }

      if (error instanceof ValidationError) {
        return res.status(400).json({ messages: ["invalid customer details"] })
      }

      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  }
}
