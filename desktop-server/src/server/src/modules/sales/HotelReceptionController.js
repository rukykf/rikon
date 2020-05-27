const { DateTime } = require("luxon")
const Room = require("../../data-access/models/Room")
const Reservation = require("../../data-access/models/Reservation")
const Booking = require("../../data-access/models/Booking")

async function getCurrentReservationForRoom(room) {
  let reservation = await Reservation.query()
    .where("room_id", "=", room.id)
    .andWhere("start_date", "=", DateTime.local().toISODate())
    .andWhere("status", "=", "open")
    .first()
  return reservation
}

async function getCurrentBookingForRoom(room) {
  let booking = await Booking.query()
    .where("room_id", "=", room.id)
    .andWhere("status", "=", "open")
    .first()
  return booking
}

module.exports = {
  async getAllRooms(req, res) {
    try {
      let rooms = await Room.query().withGraphFetched("room_type")
      let output = []
      for (let i = 0; i < rooms.length; i++) {
        let reservation = await getCurrentReservationForRoom(rooms[i])
        let booking = await getCurrentBookingForRoom(rooms[i])

        if (reservation != null) {
          output.push({
            room: rooms[i],
            room_status: "reserved"
          })
        } else if (booking != null) {
          output.push({
            room: rooms[i],
            room_status: "booked"
          })
        } else {
          output.push({
            room: rooms[i],
            room_status: "available"
          })
        }
      }
      return res.json(output)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async getAllReservedRooms(req, res) {
    try {
      let rooms = await Room.query().withGraphFetched("room_type")
      let output = []
      for (let i = 0; i < rooms.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        let reservation = await getCurrentReservationForRoom(rooms[i])
        if (reservation != null) {
          output.push({
            room: rooms[i],
            room_status: "reserved"
          })
        }
      }
      return res.json(output)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async getAllBookedRooms(req, res) {
    try {
      let rooms = await Room.query().withGraphFetched("room_type")
      let output = []
      for (let i = 0; i < rooms.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        let booking = await getCurrentBookingForRoom(rooms[i])

        if (booking != null) {
          output.push({
            room: rooms[i],
            room_status: "booked"
          })
        }
      }
      return res.json(output)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async getAllAvailableRooms(req, res) {
    try {
      let rooms = await Room.query().withGraphFetched("room_type")
      let output = []
      for (let i = 0; i < rooms.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        let reservation = await getCurrentReservationForRoom(rooms[i])
        // eslint-disable-next-line no-await-in-loop
        let booking = await getCurrentBookingForRoom(rooms[i])

        if (reservation == null && booking == null) {
          output.push({
            room: rooms[i],
            room_status: "available"
          })
        }
      }
      return res.json(output)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  }
}
