<script>
  import Layout from "@layouts/main"
  import RoomOccupationAnalytics from "@components/shared/room-occupation-analytics"
  import RoomOccupationHistoryAnalytics from "@components/shared/room-occupation-history-analytics"
  export default {
    name: "room-analytics",
    components: { RoomOccupationHistoryAnalytics, RoomOccupationAnalytics, Layout },
    data() {
      return {
        tabs: ["Room Occupation Analytics", "Number of Closed Bookings per Room Breakdown"],
        currentTab: "Room Occupation Analytics",
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
        <RoomOccupationAnalytics v-if="currentTab === 'Room Occupation Analytics'"></RoomOccupationAnalytics>
        <RoomOccupationHistoryAnalytics
          v-if="currentTab === 'Number of Closed Bookings per Room Breakdown'"
        ></RoomOccupationHistoryAnalytics>
      </keep-alive>
    </div>
  </Layout>
</template>

<style scoped></style>
