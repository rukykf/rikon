const { DateTime } = require("luxon")
const db = require(".../../../../src/data-access/db-config")
const ReservationsController = require("../../../../src/modules/sales/ReservationsController")
const Reservation = require("../../../../src/data-access/models/Reservation")
const Room = require("../../../../src/data-access/models/Room")

let rooms = []

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
  await Room.query().delete()
  let room = await Room.query().insert({
    room_no: 101,
    room_type_id: 2
  })
  rooms.push(room)

  room = await Room.query().insert({
    room_no: 102,
    room_type_id: 4
  })
  rooms.push(room)
})

beforeEach(async () => {
  await Reservation.query().delete()
})

afterAll(async () => {
  await Room.query().delete()
  await Reservation.query().delete()
})

async function populateReservations() {
  let reservations = []
  let oldClosedReservation = await Reservation.query().insert({
    room_id: rooms[0].id,
    created_at: DateTime.local()
      .minus({ days: 100 })
      .toISODate(),
    start_date: DateTime.local()
      .minus({ days: 90 })
      .toISODate(),
    end_date: DateTime.local()
      .minus({ days: 80 })
      .toISODate(),
    status: "closed",
    customer_details: { full_name: "some name", phone_number: "some number" }
  })
  reservations.push(oldClosedReservation)

  let recentClosedReservation = await Reservation.query().insert({
    room_id: rooms[0].id,
    created_at: DateTime.local()
      .minus({ days: 30 })
      .toISODate(),
    start_date: DateTime.local()
      .minus({ days: 25 })
      .toISODate(),
    end_date: DateTime.local()
      .minus({ days: 20 })
      .toISODate(),
    status: "closed",
    customer_details: { full_name: "some name", phone_number: "some number" }
  })
  reservations.push(recentClosedReservation)

  let recentOpenReservation = await Reservation.query().insert({
    room_id: rooms[1].id,
    created_at: DateTime.local()
      .minus({ days: 12 })
      .toISODate(),
    start_date: DateTime.local()
      .plus({ days: 11 })
      .toISODate(),
    end_date: DateTime.local()
      .plus({ days: 14 })
      .toISODate(),
    customer_details: { full_name: "some name", phone_number: "some number" }
  })
  reservations.push(recentOpenReservation)

  let recentClosedReservationForRoom2 = await Reservation.query().insert({
    room_id: rooms[1].id,
    created_at: DateTime.local()
      .minus({ days: 30 })
      .toISODate(),
    start_date: DateTime.local()
      .minus({ days: 25 })
      .toISODate(),
    end_date: DateTime.local()
      .minus({ days: 20 })
      .toISODate(),
    status: "closed",
    customer_details: { full_name: "some name", phone_number: "some number" }
  })
  reservations.push(recentClosedReservationForRoom2)
  return reservations
}

test("ReservationsController.index returns list of reservations created in last 90 days by default", async () => {
  let reservations = await populateReservations()
  let req = {}

  let output = []
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }
  await ReservationsController.index(req, res)
  expect(output.length).toEqual(3)
  expect(output[0]).toMatchObject(reservations[1])
  expect(output[1]).toMatchObject(reservations[2])
})

test("ReservationsController.index successfully filters list of reservations by date", async () => {
  let reservations = await populateReservations()
  let req = {
    query: {
      start_date: DateTime.local()
        .minus({ days: 120 })
        .toISODate(),
      end_date: DateTime.local()
        .minus({ days: 90 })
        .toISODate()
    }
  }

  let output = []
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }
  await ReservationsController.index(req, res)
  expect(output.length).toEqual(1)
  expect(output[0]).toMatchObject(reservations[0])
})

test("ReservationsController.index successfully filters list of reservations by status", async () => {
  let reservations = await populateReservations()
  let req = { query: { status: "open" } }

  let output = []
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }
  await ReservationsController.index(req, res)
  expect(output.length).toEqual(1)
  expect(output[0]).toMatchObject(reservations[2])
})

test("ReservationsController.createReservationForRoom returns newly created reservation when passed valid data", async () => {
  let req = {
    params: { id: rooms[1].id },
    body: {
      start_date: DateTime.local()
        .plus({ days: 50 })
        .toISODate(),
      end_date: DateTime.local()
        .plus({ days: 60 })
        .toISODate(),
      customer_details: { full_name: "some customer", phone_number: "0812345678" }
    }
  }
  let output
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }
  await ReservationsController.createReservationForRoom(req, res)
  expect(output).toMatchObject(req.body)
})

test("ReservationsController.createReservationForRoom returns error message when passed invalid dates", async () => {
  let req = {
    params: { id: rooms[1].id },
    body: {
      start_date: DateTime.local()
        .plus({ days: 50 })
        .toISODate(),
      end_date: DateTime.local()
        .plus({ days: 40 })
        .toISODate(),
      customer_details: { full_name: "some customer", phone_number: "0812345678" }
    }
  }

  let res = {
    json: jest.fn(),
    status: jest.fn()
  }
  res.status.mockReturnThis()
  await ReservationsController.createReservationForRoom(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["the dates for this reservation are invalid"] })

  req.body.start_date = DateTime.local().toISODate()
  await ReservationsController.createReservationForRoom(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["the dates for this reservation are invalid"] })

  req.body.start_date = null
  await ReservationsController.createReservationForRoom(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["the dates for this reservation are invalid"] })
})

test("ReservationsController.createReservationForRoom returns error message when passed invalid customer details", async () => {
  let req = {
    params: { id: rooms[1].id },
    body: {
      start_date: DateTime.local()
        .plus({ days: 50 })
        .toISODate(),
      end_date: DateTime.local()
        .plus({ days: 60 })
        .toISODate(),
      customer_details: { full_name: "some customer" }
    }
  }

  let res = {
    json: jest.fn(),
    status: jest.fn()
  }
  res.status.mockReturnThis()
  await ReservationsController.createReservationForRoom(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["customer name and phone number are required"] })
})

test("ReservationsController.createReservationForRoom returns error message when reservation date conflicts with an existing reservation", async () => {
  await populateReservations()
  let req = {
    params: { id: rooms[1].id },
    body: {
      start_date: DateTime.local()
        .plus({ days: 10 })
        .toISODate(),
      end_date: DateTime.local()
        .plus({ days: 12 })
        .toISODate(),
      customer_details: { full_name: "some customer", phone_number: "08123456789" }
    }
  }

  let res = {
    json: jest.fn(),
    status: jest.fn()
  }
  res.status.mockReturnThis()
  await ReservationsController.createReservationForRoom(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["a reservation already exists at the selected end date"] })

  req.body.start_date = DateTime.local()
    .plus({ days: 12 })
    .toISODate()
  req.body.end_date = DateTime.local()
    .plus({ days: 50 })
    .toISODate()
  await ReservationsController.createReservationForRoom(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["a reservation already exists at the selected start date"] })
})

test("ReservationsController.getCurrentReservationForRoom returns the reservation starting today for a room", async () => {
  let currentClosedReservation = await Reservation.query().insert({
    room_id: rooms[1].id,
    created_at: DateTime.local()
      .minus({ days: 12 })
      .toISODate(),
    start_date: DateTime.local().toISODate(),
    end_date: DateTime.local()
      .plus({ days: 14 })
      .toISODate(),
    customer_details: { full_name: "some name", phone_number: "some number" },
    status: "closed"
  })

  let currentReservation = await Reservation.query().insert({
    room_id: rooms[1].id,
    created_at: DateTime.local()
      .minus({ days: 12 })
      .toISODate(),
    start_date: DateTime.local().toISODate(),
    end_date: DateTime.local()
      .plus({ days: 14 })
      .toISODate(),
    customer_details: { full_name: "some name", phone_number: "some number" }
  })
  let req = { params: { id: rooms[1].id } }
  let output
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }
  await ReservationsController.getCurrentReservationForRoom(req, res)
  expect(output.status).toEqual("open")
  expect(output).toMatchObject(currentReservation)
})

test("ReservationsController.getReservationsForRoom returns all reservations for a particular room", async () => {
  let reservations = await populateReservations()
  let req = { params: { id: rooms[1].id } }

  let output
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }
  await ReservationsController.getReservationsForRoom(req, res)
  expect(output.length).toEqual(2)
  expect(output[0]).toMatchObject(reservations[2])
  expect(output[1]).toMatchObject(reservations[3])
})

test("ReservationsController.getReservationsForRoom filters list of reservations by status", async () => {
  let reservations = await populateReservations()
  let req = { params: { id: rooms[1].id }, query: { status: "open" } }

  let output
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }
  await ReservationsController.getReservationsForRoom(req, res)
  expect(output.length).toEqual(1)
  expect(output[0]).toMatchObject(reservations[2])
})

test("ReservationsController.updateReservationStatus returns updated reservation when passed valid data", async () => {
  let reservations = await populateReservations()
  let req = { params: { id: reservations[2].id }, body: { status: "closed" } }

  let output
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }
  await ReservationsController.updateReservationStatus(req, res)
  expect(output).toMatchObject(reservations[2])
})

test("ReservationsController.updateReservationStatus returns error message when passed invalid status", async () => {
  let reservations = await populateReservations()
  let req = { params: { id: reservations[2].id }, body: { status: "some status" } }

  let res = {
    json: jest.fn(),
    status: jest.fn()
  }
  res.status.mockReturnThis()

  await ReservationsController.updateReservationStatus(req, res)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["invalid reservation status"] })
  expect(res.status).toHaveBeenLastCalledWith(400)
})

test("ReservationsController.updateReservationStatus returns error message when passed invalid reservation id", async () => {
  let req = { params: { id: 900 }, body: { status: "closed" } }

  let res = {
    json: jest.fn(),
    status: jest.fn()
  }
  res.status.mockReturnThis()

  await ReservationsController.updateReservationStatus(req, res)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["invalid reservation id"] })
  expect(res.status).toHaveBeenLastCalledWith(400)
})

test("ReservationsController.show returns the selected reservation when passed valid reservation id", async () => {
  let reservations = await populateReservations()
  let req = { params: { id: reservations[0].id } }
  let res = { json: jest.fn() }

  await ReservationsController.show(req, res)
  expect(res.json).toHaveBeenLastCalledWith(expect.objectContaining(reservations[0]))
})

test("ReservationsController.show returns error message when passed invalid reservation id", async () => {
  let req = { params: { id: 10 } }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()

  await ReservationsController.show(req, res)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["could not retrieve selected reservation"] })
})
