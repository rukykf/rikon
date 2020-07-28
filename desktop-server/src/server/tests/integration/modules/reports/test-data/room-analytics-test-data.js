const { DateTime } = require("luxon")
const Booking = require("../../../../../src/data-access/models/Booking")
const Room = require("../../../../../src/data-access/models/Room")
const RoomType = require("../../../../../src/data-access/models/RoomType")

let roomTypes = []
let rooms = []
let bookings = []
let output = { roomTypes: roomTypes, rooms: rooms, bookings: bookings }

module.exports = {
  async populateWithCurrentRoomOccupationData() {
    resetData()
    await populateRoomTypesAndRooms()

    let date = DateTime.local().toISODate()

    let occupiedRooms = [rooms[0], rooms[3], rooms[4], rooms[5]]
    let unoccupiedRooms = [rooms[1], rooms[6], rooms[7], rooms[8]]

    for (let i = 0; i < occupiedRooms.length; i++) {
      let room = occupiedRooms[i]
      await populateBookingForRoom(room.id, date, "open")
    }

    for (let i = 0; i < unoccupiedRooms.length; i++) {
      let room = unoccupiedRooms[i]
      await populateBookingForRoom(room.id, date, "closed")
    }
    return output
  },

  // best to delete all data in db before calling these methods to avoid unique constraint violation errors

  async populateWithHistoricalRoomBookingData() {
    resetData()
    await populateRoomTypesAndRooms()

    let roomsWithClosedBookings100DaysAgo = [rooms[6], rooms[7], rooms[8]] // look at how the room types and rooms are populated to get these indexes
    let roomsWithRecentBookings = [rooms[0], rooms[3], rooms[4]]

    let oldDate = DateTime.local()
      .minus({ days: 100 })
      .toISODate()
    let date = DateTime.local().toISODate()

    for (let i = 0; i < roomsWithClosedBookings100DaysAgo.length; i++) {
      let room = roomsWithClosedBookings100DaysAgo[i]
      await populateBookingForRoom(room.id, oldDate, "closed")
      await populateBookingForRoom(room.id, oldDate, "closed")
    }

    for (let i = 0; i < roomsWithRecentBookings.length; i++) {
      let room = roomsWithRecentBookings[i]
      await populateBookingForRoom(room.id, date, "closed")
      await populateBookingForRoom(room.id, date, "open")
      await populateBookingForRoom(room.id, date, "closed")
    }

    return output
  },

  async deleteAllDataFromDB() {
    await RoomType.query().delete()
    await Room.query().delete()
    await Booking.query().delete()
  }
}

function resetData() {
  roomTypes = []
  rooms = []
  bookings = []
  output = { roomTypes: roomTypes, rooms: rooms, bookings: bookings }
}

async function populateBookingForRoom(roomId, createdAtDate, bookingStatus) {
  let booking = await Booking.query().insert({
    created_at: createdAtDate,
    updated_at: createdAtDate,
    start_date: createdAtDate,
    end_date: createdAtDate,
    price_per_night: 4000,
    room_id: roomId,
    customer_details: { name: "some name" },
    status: bookingStatus
  })
  bookings.push(booking)
  return booking
}

async function populateRoomTypesAndRooms() {
  let standard = await RoomType.query().insert({
    name: "standard",
    price_per_night: 3000
  })
  roomTypes.push(standard)
  await createRoomsForRoomType(standard.id, 100)

  let deluxe = await RoomType.query().insert({
    name: "deluxe",
    price_per_night: 4000
  })
  roomTypes.push(deluxe)
  await createRoomsForRoomType(deluxe.id, 200)

  let classic = await RoomType.query().insert({
    name: "classic",
    price_per_night: 5000
  })
  roomTypes.push(classic)
  await createRoomsForRoomType(classic.id, 300)
}

async function createRoomsForRoomType(roomTypeId, startingRoomNum) {
  for (let i = 0; i < 3; i++) {
    let room = await Room.query().insert({
      room_no: startingRoomNum,
      room_type_id: roomTypeId
    })
    startingRoomNum += 1
    rooms.push(room)
  }
}
