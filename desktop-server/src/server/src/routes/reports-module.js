const { Router } = require("express")
const DepartmentAnalyticsController = require("../modules/reports/DepartmentAnalyticsController")
const SalesItemsAnalyticsController = require("../modules/reports/SalesItemAnalyticsController")
const RoomAnalyticsController = require("../modules/reports/RoomAnalyticsController")

let router = Router()

router.get("/booking-analytics", DepartmentAnalyticsController.getBookingsSalesBreakdown)
router.get("/department-analytics", DepartmentAnalyticsController.getDepartmentSalesBreakdownFromSalesTable)
router.get("/sales-items-analytics", SalesItemsAnalyticsController.getQuantityBreakdownForSalesItems)
router.get("/detailed-sales-items-analytics", SalesItemsAnalyticsController.getDetailedOrderBreakdownForSalesItems)
router.get("/current-room-analytics", RoomAnalyticsController.getRoomOccupationAnalyticsByRoomType)
router.get("/historical-room-analytics", RoomAnalyticsController.getHistoricalRoomBookingAnalyticsByRoomType)
module.exports = router
