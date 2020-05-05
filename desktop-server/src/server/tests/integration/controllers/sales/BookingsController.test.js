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
      .minus({ days: 99 })
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

test("Booking.getNumNights returns the correct number of nights between start and end date", async () => {
  let startDate = DateTime.local().toISODate()
  let endDate = DateTime.local().toISODate()

  let numberOfNights = Booking.getNumNights(startDate, endDate)
  expect(numberOfNights).toEqual(1)

  startDate = DateTime.local().toISODate()
  endDate = DateTime.local()
    .plus({ days: 1 })
    .toISODate()
  numberOfNights = Booking.getNumNights(startDate, endDate)
  expect(numberOfNights).toEqual(1)

  startDate = DateTime.local().toISODate()
  endDate = DateTime.local()
    .plus({ days: 2 })
    .toISODate()
  numberOfNights = Booking.getNumNights(startDate, endDate)
  expect(numberOfNights).toEqual(2)
})

test("BookingsController.index returns list of bookings created in last 90 days by default", async () => {
  let bookings = await populateBookings()
  let req = {}
  let output
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await BookingsController.index(req, res)
  expect(output.length).toEqual(2)
  expect(output[0]).toMatchObject(bookings[1])
  expect(output[1]).toMatchObject(bookings[2])
})

test("BookingsController.index successfully filters bookings by date", async () => {
  let bookings = await populateBookings()
  let req = {
    query: {
      start_date: DateTime.local()
        .minus({ days: 4 })
        .toISODate(),
      end_date: DateTime.local()
        .minus({ days: 2 })
        .toISODate()
    }
  }
  let output
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await BookingsController.index(req, res)
  expect(output.length).toEqual(1)
  expect(output[0]).toMatchObject(bookings[1])
})

test("BookingsController.index successfully filters bookings by status", async () => {
  let bookings = await populateBookings()
  let req = { query: { status: "open" } }
  let output
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await BookingsController.index(req, res)
  expect(output.length).toEqual(1)
  expect(output[0]).toMatchObject(bookings[2])
})

test("BookingsController.createBookingForRoom successfully creates bookings for room when passed valid data", async () => {
  let req = {
    params: { id: rooms[0].id },
    body: { customer_details: { name: "customer's name", phone_number: "081234567890" } }
  }
  let res = { json: jest.fn() }
  await BookingsController.createBookingForRoom(req, res)
  expect(res.json).toHaveBeenLastCalledWith(expect.objectContaining(req.body))
})

test("BookingsController.createBookingForRoom returns error message when room is already booked", async () => {
  await populateBookings()
  let req = {
    params: { id: rooms[2].id },
    body: { customer_details: { name: "customer's name", phone_number: "081234567890" } }
  }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()

  await BookingsController.createBookingForRoom(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["this room is already booked"] })
})

test("BookingsController.createBookingForRoom returns error message when passed invalid room id", async () => {
  let req = {
    params: { id: 50 },
    body: { customer_details: { name: "customer's name", phone_number: "081234567890" } }
  }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()

  await BookingsController.createBookingForRoom(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["invalid room id"] })
})

test("BookingsController.createBookingForRoom returns error message when passed invalid customer data", async () => {
  await populateBookings()
  let req = {
    params: { id: rooms[1].id },
    body: { customer_details: null }
  }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()

  await BookingsController.createBookingForRoom(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["invalid customer data"] })
})

test("BookingsController.getCurrentBookingForRoom returns booking details for a currently booked room, if any", async () => {
  let bookings = await populateBookings()
  let req = { params: { id: rooms[2].id } }
  let output
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await BookingsController.getCurrentBookingForRoom(req, res)
  expect(output).toMatchObject(bookings[2])

  req.params.id = rooms[0].id
  await BookingsController.getCurrentBookingForRoom(req, res)
  expect(output).toBeUndefined()
})

test("BookingsController.getBookingsForRoom returns all bookings for a room", async () => {
  let bookings = await populateBookings()
  let req = { params: { id: rooms[2].id } }
  let output
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }

  await BookingsController.getBookingsForRoom(req, res)
  expect(output.length).toEqual(2)
  expect(output[1]).toMatchObject(bookings[2])
})

test("BookingsController.closeBooking successfully closes booking when passed valid data", async () => {
  let bookings = await populateBookings()
  let saleForOpenBooking = await Sale.query().insert({
    sellable_type: "booking",
    sellable_id: bookings[2].id,
    total_amount: 4000,
    total_paid: 4000,
    total_complementary: 0,
    total_due: 0,
    status: "paid"
  })
  let req = { params: { id: bookings[2].id } }
  let res = { json: jest.fn() }
  await BookingsController.closeBooking(req, res)
  expect(res.json).toHaveBeenLastCalledWith(expect.objectContaining({ status: "closed" }))

  // test with credit transactions
  await Sale.query().patchAndFetchById(saleForOpenBooking.id, {
    total_paid: 0,
    total_due: 4000,
    credit_authorized_by: { name: "some name" },
    status: "owing"
  })
  // re-open booking so that the test works
  await Booking.query().patchAndFetchById(bookings[2].id, { status: "open" })

  await BookingsController.closeBooking(req, res)
  expect(res.json).toHaveBeenLastCalledWith(expect.objectContaining({ status: "closed" }))
})

test("BookingsController.closeBooking returns error message when booking is not fully paid or credit", async () => {
  let bookings = await populateBookings()

  let req = { params: { id: bookings[2].id } }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await BookingsController.closeBooking(req, res)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["you cannot close the booking without making full payment"] })
  expect(res.status).toHaveBeenLastCalledWith(400)

  let saleForOpenBooking = await Sale.query().insert({
    sellable_type: "booking",
    sellable_id: bookings[2].id,
    total_amount: 4000,
    total_paid: 2000,
    total_complementary: 0,
    total_due: 2000,
    status: "paid"
  })

  req = { params: { id: bookings[2].id } }
  res.status.mockReturnThis()
  await BookingsController.closeBooking(req, res)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["you cannot close the booking without making full payment"] })
  expect(res.status).toHaveBeenLastCalledWith(400)
})
