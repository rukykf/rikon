const faker = require("faker")
const { DateTime } = require("luxon")

const roomTypes = [
  { id: 1, price_per_night: 5000, name: "classic" },
  { id: 2, price_per_night: 6000, name: "deluxe" },
  { id: 3, price_per_night: 10000, name: "VIP" },
  { id: 4, price_per_night: 15000, name: "VIP-Suite" }
]

let closedBookings = []
let openBookings = []
let reservations = []
let rooms = []

let roomsCount = 1
let reservationsCount = 1
let bookingsCount = 1

function generateHistoricalReservations(room) {
  let num = faker.random.arrayElement([0, 2, 5])
  let currentDate = DateTime.local()
  for (let i = 0; i < num; i++) {
    let numBreaks = faker.random.arrayElement([3, 8, 30])
    let numDays = faker.random.arrayElement([2, 4, 7])
    let endDate = currentDate.minus({ days: numBreaks })
    let startDate = endDate.minus({ days: numDays })
    let customerDetails = faker.random.arrayElement([
      { name: "Rukky Kofi", phone: "081234567891" },
      { name: "Nero Kofi", phone: "0813234444444" }
    ])
    currentDate = startDate
    let newReservation = {
      id: reservationsCount,
      room_id: room.id,
      created_at: startDate.toISODate(),
      updated_at: startDate.toISODate(),
      start_date: startDate.toISODate(),
      end_date: endDate.toISODate(),
      customer_details: JSON.stringify(customerDetails),
      status: "closed"
    }
    reservations.push(newReservation)
    reservationsCount += 1
  }
}

function generateUpcomingReservations(room) {
  let num = faker.random.arrayElement([0, 2, 5])
  let currentDate = DateTime.local()
  for (let i = 0; i < num; i++) {
    let numBreaks = faker.random.arrayElement([3, 8, 30])
    let numDays = faker.random.arrayElement([2, 4, 7])
    let startDate = currentDate.plus({ days: numBreaks })
    let endDate = startDate.plus({ days: numDays })
    let customerDetails = faker.random.arrayElement([
      { name: "Rukky Kofi", phone: "081234567891" },
      { name: "Nero Kofi", phone: "0813234444444" }
    ])
    currentDate = endDate
    let newReservation = {
      id: reservationsCount,
      room_id: room.id,
      created_at: startDate.toISODate(),
      updated_at: startDate.toISODate(),
      start_date: startDate.toISODate(),
      end_date: endDate.toISODate(),
      customer_details: JSON.stringify(customerDetails),
      status: "open"
    }
    reservations.push(newReservation)
    reservationsCount += 1
  }
}

function generateHistoricalBookings(room, roomType) {
  let num = faker.random.arrayElement([30, 3, 5])
  let currentDate = DateTime.local()
  for (let i = 0; i < num; i++) {
    let numBreaks = faker.random.arrayElement([2, 3, 4])
    let numDays = faker.random.arrayElement([2, 3, 4])
    let endDate = currentDate.minus({ days: numBreaks })
    let startDate = endDate.minus({ days: numDays })
    let customerDetails = faker.random.arrayElement([
      { name: "Rukky Kofi", phone: "081234567891" },
      { name: "Nero Kofi", phone: "0813234444444" }
    ])
    let newBooking = {
      id: bookingsCount,
      created_at: startDate.toISODate(),
      updated_at: startDate.toISODate(),
      start_date: startDate.toISODate(),
      end_date: endDate.toISODate(),
      price_per_night: roomType.price_per_night,
      room_id: room.id,
      customer_details: JSON.stringify(customerDetails),
      status: "closed"
    }
    closedBookings.push(newBooking)
    bookingsCount += 1
    currentDate = startDate
  }
}

function generateCurrentReservation(room) {
  let currentDate = DateTime.local()
  let numDays = faker.random.arrayElement([2, 4, 7])
  let customerDetails = faker.random.arrayElement([
    { name: "Rukky Kofi", phone: "081234567891" },
    { name: "Nero Kofi", phone: "0813234444444" }
  ])
  let newReservation = {
    id: reservationsCount,
    room_id: room.id,
    created_at: currentDate.toISODate(),
    updated_at: currentDate.toISODate(),
    start_date: currentDate.toISODate(),
    end_date: currentDate.plus({ days: numDays }).toISODate(),
    customer_details: JSON.stringify(customerDetails),
    status: "open"
  }
  reservations.push(newReservation)
  reservationsCount += 1
}

function generateCurrentBooking(room, roomType) {
  let currentDate = DateTime.local()
  let customerDetails = faker.random.arrayElement([
    { name: "Rukky Kofi", phone: "081234567891" },
    { name: "Nero Kofi", phone: "0813234444444" }
  ])
  let newBooking = {
    id: bookingsCount,
    created_at: currentDate.minus({ days: 1 }).toISODate(),
    updated_at: currentDate.minus({ days: 1 }).toISODate(),
    start_date: currentDate.minus({ days: 1 }).toISODate(),
    end_date: currentDate.toISODate(),
    price_per_night: roomType.price_per_night,
    room_id: room.id,
    customer_details: JSON.stringify(customerDetails),
    status: "open"
  }
  openBookings.push(newBooking)
  bookingsCount += 1
}

function generateAvailableRooms(num) {
  for (let i = 0; i < num; i++) {
    const newRoomType = faker.random.arrayElement(roomTypes)
    const newRoom = {
      id: roomsCount,
      room_no: 100 + roomsCount,
      room_type_id: newRoomType.id
    }
    rooms.push(newRoom)
    roomsCount += 1
    generateHistoricalBookings(newRoom, newRoomType)
    generateUpcomingReservations(newRoom)
    generateHistoricalReservations(newRoom)
  }
}

function generateBookedRooms(num) {
  for (let i = 0; i < num; i++) {
    const newRoomType = faker.random.arrayElement(roomTypes)
    const newRoom = {
      id: roomsCount,
      room_no: 100 + roomsCount,
      room_type_id: newRoomType.id
    }
    rooms.push(newRoom)
    roomsCount += 1
    generateHistoricalBookings(newRoom, newRoomType)
    generateUpcomingReservations(newRoom)
    generateHistoricalReservations(newRoom)
    generateCurrentBooking(newRoom, newRoomType)
  }
}

function generateReservedRooms(num) {
  for (let i = 0; i < num; i++) {
    const newRoomType = faker.random.arrayElement(roomTypes)
    const newRoom = {
      id: roomsCount,
      room_no: 100 + roomsCount,
      room_type_id: newRoomType.id
    }
    rooms.push(newRoom)
    roomsCount += 1
    generateHistoricalBookings(newRoom, newRoomType)
    generateUpcomingReservations(newRoom)
    generateHistoricalReservations(newRoom)
    generateCurrentReservation(newRoom)
  }
}

generateAvailableRooms(20)
generateBookedRooms(30)
generateReservedRooms(10)

module.exports.rooms = rooms
module.exports.openBookings = openBookings
module.exports.closedBookings = closedBookings
module.exports.reservations = reservations
module.exports.roomTypes = roomTypes
