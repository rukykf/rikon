const { DateTime } = require("luxon")
const _ = require("lodash")
const { NotFoundError, ValidationError } = require("objection")
const Reservation = require("../../data-access/models/Reservation")

function isReservationDateValid(req) {
  // These dates should be ISO dates with timezones attached e.g 2020-04-28T00:00:00.000+01:00
  let startDate = _.trim(_.get(req, ["body", "start_date"]))
  let endDate = _.trim(_.get(req, ["body", "end_date"]))

  if (startDate == null || endDate == null) {
    return false
  }

  if (
    DateTime.fromISO(startDate)
      .toLocal()
      .toISODate() == null ||
    DateTime.fromISO(endDate)
      .toLocal()
      .toISODate() == null
  ) {
    return false
  }

  if (
    DateTime.fromISO(startDate)
      .toLocal()
      .toISODate() <= DateTime.local().toISODate()
  ) {
    return false
  }

  if (endDate < startDate) {
    return false
  }

  return true
}

async function checkReservationForConflicts(req) {
  // check start date
  let startDate = DateTime.fromISO(req.body.start_date)
    .toLocal()
    .toISODate()

  let reservation
  reservation = await Reservation.query()
    .where("start_date", "<=", startDate)
    .andWhere("end_date", ">=", startDate)
    .andWhere("status", "=", "open")
    .andWhere("room_id", "=", _.toNumber(req.params.id))
    .first()

  if (reservation != null) {
    return "a reservation already exists at the selected start date"
  }

  // check end date
  let endDate = DateTime.fromISO(req.body.end_date)
    .toLocal()
    .toISODate()
  reservation = await Reservation.query()
    .where("start_date", "<=", endDate)
    .andWhere("end_date", ">=", endDate)
    .andWhere("status", "=", "open")
    .andWhere("room_id", "=", _.toNumber(req.params.id))
    .first()

  if (reservation != null) {
    return "a reservation already exists at the selected end date"
  }

  return null
}

module.exports = {
  async index(req, res) {
    try {
      let startDate = _.get(req, ["query", "start_date"])
        ? req.query.start_date
        : DateTime.local()
            .minus({ days: 90 })
            .toISODate()
      let endDate = _.get(req, ["query", "end_date"]) ? req.query.end_date : DateTime.local().toISODate()

      let reservationQueryBuilder = Reservation.query()
        .where("created_at", ">=", startDate)
        .andWhere("created_at", "<=", endDate)
        .withGraphFetched("room")

      if (_.get(req, ["query", "status"]) != null) {
        reservationQueryBuilder.where("status", "=", req.query.status)
      }

      let reservations = await reservationQueryBuilder
      return res.json(reservations)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async createReservationForRoom(req, res) {
    try {
      if (!isReservationDateValid(req)) {
        return res.status(400).json({ messages: ["the dates for this reservation are invalid"] })
      }

      if (
        !_.get(req, ["body", "customer_details", "full_name"]) ||
        !_.get(req, ["body", "customer_details", "phone_number"])
      ) {
        return res.status(400).json({ messages: ["customer name and phone number are required"] })
      }

      let conflictErrorMessage = await checkReservationForConflicts(req)
      if (conflictErrorMessage != null) {
        return res.status(400).json({ messages: [conflictErrorMessage] })
      }

      let reservation = await Reservation.query().insert({
        room_id: _.toNumber(req.params.id),
        start_date: DateTime.fromISO(_.trim(req.body.start_date))
          .toLocal()
          .toISODate(),
        end_date: DateTime.fromISO(_.trim(req.body.end_date))
          .toLocal()
          .toISODate(),
        customer_details: req.body.customer_details
      })

      return res.json(reservation)
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ messages: ["invalid room id"] })
      }

      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async getCurrentReservationForRoom(req, res) {
    try {
      let reservation = await Reservation.query()
        .where("room_id", "=", _.toNumber(req.params.id))
        .andWhere("start_date", "=", DateTime.local().toISODate())
        .andWhere("status", "=", "open")
        .first()
      return res.json(reservation)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, please try again"] })
    }
  },

  async getReservationsForRoom(req, res) {
    try {
      // automatically close all reservations that ended before yesterday
      let yesterday = DateTime.local()
        .minus({ days: 1 })
        .toISODate()
      await Reservation.query()
        .where("end_date", "<=", yesterday)
        .patch({
          status: "closed"
        })

      // retrieve a list of all reservations for this room
      let reservationsQueryBuilder = Reservation.query().where("room_id", "=", _.toNumber(req.params.id))

      // filter by status if a status filter is available
      if (_.get(req, ["query", "status"]) != null) {
        reservationsQueryBuilder.andWhere("status", "=", req.query.status)
      }

      let reservations = await reservationsQueryBuilder
      return res.json(reservations)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async updateReservationStatus(req, res) {
    try {
      let reservation = await Reservation.query()
        .patchAndFetchById(_.toNumber(req.params.id), {
          status: _.get(req, ["body", "status"])
        })
        .throwIfNotFound()
      return res.json(reservation)
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ messages: ["invalid reservation status"] })
      }

      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["invalid reservation id"] })
      }

      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async show(req, res) {
    try {
      let reservation = await Reservation.query()
        .findById(_.toNumber(req.params.id))
        .throwIfNotFound()
      return res.json(reservation)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not retrieve selected reservation"] })
      }
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  }
}
