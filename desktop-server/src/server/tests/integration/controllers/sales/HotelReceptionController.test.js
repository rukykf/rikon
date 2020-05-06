const { DateTime } = require("luxon")
const db = require(".../../../../src/data-access/db-config")
const HotelReceptionController = require("../../../../src/controllers/sales/HotelReceptionController")
const Reservation = require("../../../../src/data-access/models/Reservation")
const Booking = require("../../../../src/data-access/models/Booking")
const Room = require("../../../../src/data-access/models/Room")

let rooms = []
let bookings = []
let reservations = []

async function populateRooms() {
  let bookedRoom = await Room.query().insert({
    room_no: 101,
    room_type_id: 2
  })
  let booking = await Booking.query().insert({
    start_date: DateTime.local().toISODate(),
    end_date: DateTime.local().toISODate(),
    price_per_night: 5000,
    room_id: bookedRoom.id,
    customer_details: { name: "some name" },
    status: "open"
  })
  rooms.push(bookedRoom)
  bookings.push(booking)

  let reservedRoom = await Room.query().insert({
    room_no: 102,
    room_type_id: 2
  })
  let reservation = await Reservation.query().insert({
    start_date: DateTime.local().toISODate(),
    end_date: DateTime.local()
      .plus({ days: 10 })
      .toISODate(),
    customer_details: { name: "some name" },
    status: "open",
    room_id: reservedRoom.id
  })
  rooms.push(reservedRoom)
  reservations.push(reservation)

  let availableRoom = await Room.query().insert({
    room_no: 109,
    room_type_id: 2
  })
  let closedReservationForAvailableRoom = await Reservation.query().insert({
    start_date: DateTime.local().toISODate(),
    end_date: DateTime.local()
      .plus({ days: 10 })
      .toISODate(),
    customer_details: { name: "some name" },
    status: "closed",
    room_id: availableRoom.id
  })
  rooms.push(availableRoom)
  reservations.push(closedReservationForAvailableRoom)
}

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
  await populateRooms()
})

test("HotelReceptionController.getAllRooms returns a classified list of all rooms", async () => {
  let req = {}
  let output
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }
  await HotelReceptionController.getAllRooms(req, res)
  expect(output.length).toEqual(3)
  expect(output[0].room).toMatchObject(rooms[0])
  expect(output[1].room).toMatchObject(rooms[1])
  expect(output[2].room).toMatchObject(rooms[2])
})

test("HotelReceptionController.getAllReservedRooms returns all reserved rooms", async () => {
  let req = {}
  let output
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }
  await HotelReceptionController.getAllReservedRooms(req, res)
  expect(output.length).toEqual(1)
  expect(output[0].room).toMatchObject(rooms[1])
})

test("HotelReceptionController.getAllBookedRooms returns all booked rooms", async () => {
  let req = {}
  let output
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }
  await HotelReceptionController.getAllBookedRooms(req, res)
  expect(output.length).toEqual(1)
  expect(output[0].room).toMatchObject(rooms[0])
})

test("HotelReceptionController.getAllAvailableRooms returns all available rooms", async () => {
  let req = {}
  let output
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }
  await HotelReceptionController.getAllAvailableRooms(req, res)
  expect(output.length).toEqual(1)
  expect(output[0].room).toMatchObject(rooms[2])
})
