<script>
  import Layout from "@layouts/main"
  import BookingHistory from "@views/pages/hotel-bookings/components/booking-history"
  import RoomOccupationAnalytics from "@views/pages/hotel-bookings/components/room-occupation-analytics"
  import CashSalesPosBreakdown from "@components/shared/cash-sales-pos-breakdown"

  export default {
    name: "hotel-rooms-reports",
    components: {
      CashSalesPosBreakdown,
      RoomOccupationAnalytics,
      BookingHistory,
      Layout,
    },
    data() {
      return {
        tabs: ["Bookings", "Room Occupation Analytics", "Cash, POS, Transfer...Breakdown"],
        currentTab: "Bookings",
      }
    },
  }
</script>

<template>
  <Layout>
    <div class="mt-5">
      <b-nav tabs justified>
        <b-nav-item v-for="tab in tabs" :key="tab" :active="currentTab === tab" @click="currentTab = tab">
          <h5 :class="currentTab === tab ? 'font-weight-bold' : 'font-weight-normal'">{{
            tab[0].toUpperCase() + tab.slice(1)
          }}</h5>
        </b-nav-item>
      </b-nav>

      <keep-alive>
        <BookingHistory v-if="currentTab === 'Bookings'"></BookingHistory>
        <RoomOccupationAnalytics v-else-if="currentTab === 'Room Occupation Analytics'"></RoomOccupationAnalytics>
        <CashSalesPosBreakdown v-else-if="(currentTab = 'Cash, POS, Transfer...Breakdown')"></CashSalesPosBreakdown>
      </keep-alive>
    </div>
  </Layout>
</template>

<style scoped></style>
