const { DateTime } = require("luxon")
const db = require("../../../../src/data-access/db-config")
const RoomAnalyticsTestDataFactory = require("./test-data/room-analytics-test-data")
const RoomAnalyticsController = require("../../../../src/modules/reports/RoomAnalyticsController")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

beforeEach(async () => {
  await RoomAnalyticsTestDataFactory.deleteAllDataFromDB()
})

test("RoomAnalyticsController.getRoomOccupationAnalyticsByRoomType returns accurate occupation stats for each RoomType", async () => {
  await RoomAnalyticsTestDataFactory.populateWithCurrentRoomOccupationData()

  let output = null
  let req = {}
  let res = { json: jest.fn((args) => (output = args)) }

  await RoomAnalyticsController.getRoomOccupationAnalyticsByRoomType(req, res)
  expect(output.length).toEqual(3)
  expect(output[2].name).toEqual("standard")
  expect(output[2].num_occupied_rooms).toEqual(1)
  expect(output[2].num_unoccupied_rooms).toEqual(2)

  expect(output[1].name).toEqual("deluxe")
  expect(output[1].num_occupied_rooms).toEqual(3)
  expect(output[1].num_unoccupied_rooms).toEqual(0)

  expect(output[0].name).toEqual("classic")
  expect(output[0].num_occupied_rooms).toEqual(0)
  expect(output[0].num_unoccupied_rooms).toEqual(3)
})

test("RoomAnalyticsController.getHistoricalRoomBookingAnalyticsByRoomType returns quantity of closed bookings for each RoomType", async () => {
  await RoomAnalyticsTestDataFactory.populateWithHistoricalRoomBookingData()

  let output = null
  let req = {}
  let res = { json: jest.fn((args) => (output = args)) }

  await RoomAnalyticsController.getHistoricalRoomBookingAnalyticsByRoomType(req, res)

  expect(output.length).toEqual(2)

  expect(output[0].name).toEqual("deluxe")
  expect(output[0].quantity).toEqual(4)

  expect(output[1].name).toEqual("standard")
  expect(output[1].quantity).toEqual(2)
})

test("RoomAnalyticsController.getHistoricalRoomBookingAnalyticsByRoomType successfully filters by date", async () => {
  await RoomAnalyticsTestDataFactory.populateWithHistoricalRoomBookingData()

  let output = null
  let req = {
    query: {
      start_date: DateTime.local()
        .minus({ days: 200 })
        .toISODate()
    }
  }
  let res = { json: jest.fn((args) => (output = args)) }

  await RoomAnalyticsController.getHistoricalRoomBookingAnalyticsByRoomType(req, res)

  expect(output.length).toEqual(3)
  expect(output[0].name).toEqual("classic")
  expect(output[0].quantity).toEqual(6)

  expect(output[1].name).toEqual("deluxe")
  expect(output[1].quantity).toEqual(4)
})
