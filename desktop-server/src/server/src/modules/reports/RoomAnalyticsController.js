const db = require("../../data-access/db-config")
const RoomType = require("../../data-access/models/RoomType")
const HistoricalRoomBookingAnalytics = require("./RequestModels/HistoricalRoomBookingAnalyticsRequestModel")

module.exports = {
  async getRoomOccupationAnalyticsByRoomType(req, res) {
    try {
      let roomTypes = await RoomType.query()
        .withGraphFetched("rooms.currentBooking")
        .orderBy("name")
      let roomTypesAnalytics = []

      roomTypes.forEach((roomType) => {
        let numUnoccupiedRooms = 0
        let numOccupiedRooms = 0

        roomType.rooms.forEach((room) => {
          if (room.currentBooking == null) {
            numUnoccupiedRooms += 1
          } else {
            numOccupiedRooms += 1
          }
        })

        roomTypesAnalytics.push(
          new RoomOccupationAnalyticsForRoomType(roomType.name, numOccupiedRooms, numUnoccupiedRooms)
        )
      })
      return res.json(roomTypesAnalytics)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  },

  async getHistoricalRoomBookingAnalyticsByRoomType(req, res) {
    try {
      let requestModel = new HistoricalRoomBookingAnalytics(req)

      let roomBookingAnalyticsQueryString =
        "select name, count(bookings.id) as quantity from room_types join rooms on room_types.id = rooms.room_type_id join bookings on rooms.id = bookings.room_id where bookings.status = 'closed' and bookings.created_at >= :startDate and bookings.created_at <= :endDate group by room_types.name order by room_types.name"

      let queryParams = {
        startDate: requestModel.start_date,
        endDate: requestModel.end_date
      }

      let roomBookingAnalytics = await db.raw(roomBookingAnalyticsQueryString, queryParams)
      return res.json(roomBookingAnalytics)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  }
}

class RoomOccupationAnalyticsForRoomType {
  constructor(roomTypeName, numOccupiedRooms, numUnoccupiedRooms) {
    this.name = roomTypeName
    this.num_occupied_rooms = numOccupiedRooms
    this.num_unoccupied_rooms = numUnoccupiedRooms
  }
}
