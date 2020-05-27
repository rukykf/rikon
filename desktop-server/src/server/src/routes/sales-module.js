const { Router } = require("express")
const HotelReceptionController = require("../modules/sales/HotelReceptionController")
const BookingsController = require("../modules/sales/BookingsController")
const ReservationsController = require("../modules/sales/ReservationsController")
const SalesController = require("../modules/sales/SalesController")

let router = Router()

router.get("/hotel-rooms", HotelReceptionController.getAllRooms)
router.post("/hotel-rooms/:id/bookings", BookingsController.createBookingForRoom)
router.get("/hotel-rooms/:id/booking", BookingsController.getCurrentBookingForRoom)
router.get("/hotel-rooms/:id/reservations", ReservationsController.getReservationsForRoom)
router.post("/hotel-rooms/:id/reservations", ReservationsController.createReservationForRoom)
router.get("/hotel-rooms/:id/reservation", ReservationsController.getCurrentReservationForRoom)

router.patch("/bookings/:id", BookingsController.updateCustomerDetailsForBooking)
router.post("/bookings/:id", BookingsController.closeBooking)

// this should be refactored to join the post request to /bookings/:id
// as much as possible, no verbs in url to keep the API RESTful
router.post("/bookings/:id/cancel", BookingsController.cancelBooking)

router.patch("/reservations/:id", ReservationsController.updateReservationStatus)

router.get("/sales", SalesController.index)
router.post("/sales", SalesController.updateSalesRecordWithTransactionForSellable)
router.get("/sales", SalesController.getSalesTransactionsForSalesRecord)
router.post("/sales/:id", SalesController.updateSalesRecordWithTransaction)
router.post("/sales-transactions/:id", SalesController.revertSalesTransactionForSalesRecord)
module.exports = router
