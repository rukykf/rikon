const { DateTime } = require("luxon")
const db = require(".../../../../src/data-access/db-config")
const BookingsController = require("../../../../src/controllers/sales/BookingsController")
const Booking = require("../../../../src/data-access/models/Booking")
const Room = require("../../../../src/data-access/models/Room")
const Sale = require("../../../../src/data-access/models/Sale")
const RoomType = require("../../../../src/data-access/models/RoomType")

let rooms = []
let roomType

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
  await Room.query().delete()
  await RoomType.query().delete()

  roomType = await RoomType.query().insert({
    name: "Deluxe",
    price_per_night: 4000
  })

  let room = await Room.query().insert({
    room_no: 301,
    room_type_id: roomType.id
  })
  rooms.push(room)

  room = await Room.query().insert({
    room_no: 302,
    room_type_id: roomType.id
  })
  rooms.push(room)

  room = await Room.query().insert({
    room_no: 303,
    room_type_id: roomType.id
  })
  rooms.push(room)
})

beforeEach(async () => {
  await Sale.query().delete()
  await Booking.query().delete()
})

afterAll(async () => {
  await Room.query().delete()
  await RoomType.query().delete()
  await Sale.query().delete()
  await Booking.query().delete()
})

test("Booking.getNumNights returns the correct number of nights between start and end date", async () => {})

test("BookingsController.index returns list of reservations created in last 90 days by default", async () => {})

test("BookingsController.index successfully filters bookings by date", async () => {})

test("BookingsController.index successfully filters bookings by status", async () => {})

test("BookingsController.createBookingForRoom successfully creates bookings for room when passed valid data", async () => {})

test("BookingsController.createBookingForRoom returns error message when room is already booked", async () => {})

test("BookingsController.createBookingForRoom returns error message when passed invalid room id", async () => {})

test("BookingsController.createBookingForRoom returns error message when passed invalid customer data", async () => {})

test("BookingsController.getCurrentBookingForRoom returns booking details for a currently booked room, if any", async () => {})

test("BookingsController.getBookingsForRoom returns all bookings for a room", async () => {})

test("BookingsController.closeBooking successfully closes booking when passed valid data", async () => {})

test("BookingsController.closeBooking returns error message when booking is not fully paid or credit", async () => {})

test("BookingsController.closeBooking returns error message when booking is already closed", async () => {})

test("BookingsController.closeBooking returns error message when booking does not have an associated sale", async () => {})

async function populateBookings() {
  let bookings = []

  // one old, closed booking
  let booking = await Booking.query().insert({
    created_at: DateTime.local()
      .minus({ days: 100 })
      .toISO(),
    start_date: DateTime.local()
      .minus({ days: 100 })
      .toISODate(),
    end_date: DateTime.local()
      .minus({ days: 100 })
      .toISODate(),
    price_per_night: 4000,
    room_id: rooms[0].id,
    status: "closed",
    customer_details: { name: "some customer name" }
  })
  bookings.push(booking)

  // one fairly recent closed booking
  booking = await Booking.query().insert({
    created_at: DateTime.local()
      .minus({ days: 3 })
      .toISO(),
    start_date: DateTime.local()
      .minus({ days: 3 })
      .toISODate(),
    end_date: DateTime.local()
      .minus({ days: 2 })
      .toISODate(),
    price_per_night: 4000,
    room_id: rooms[2].id,
    status: "closed",
    customer_details: { name: "some customer name" }
  })
  bookings.push(booking)

  // one recent open booking
  booking = await Booking.query().insert({
    created_at: DateTime.local().toISODate(),
    start_date: DateTime.local().toISODate(),
    end_date: DateTime.local().toISODate(),
    price_per_night: 4000,
    room_id: rooms[2].id,
    status: "open",
    customer_details: { name: "some customer name" }
  })
  bookings.push(booking)

  return bookings
}
