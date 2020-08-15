<script>
  import { DateTime } from "luxon"
  import SuccessFailureAlert from "@components/success-failure-alert"
  import DateTimeSelector from "@components/date-time-selector"
  import ManagedStateButton from "@components/managed-state-button"
  import ErrorHandler from "@src/ErrorHandler"

  export default {
    name: "room-occupation-history-analytics",
    components: { ManagedStateButton, DateTimeSelector, SuccessFailureAlert },

    data() {
      return {
        loading: false,
        filterBtnState: "initialize",
        errors: [],
        success: [],
        historicalRoomAnalytics: [],
        fromDate: DateTime.local()
          .set({ hour: 8, minute: 0 })
          .toISO(),
        toDate: DateTime.local()
          .plus({ days: 1 })
          .set({ hour: 8, minute: 0 })
          .toISO(),
        latestFromDate: DateTime.local()
          .set({ hour: 8, minute: 0 })
          .toISO(),
        latestToDate: DateTime.local()
          .plus({ days: 1 })
          .set({ hour: 8, minute: 0 })
          .toISO(),
      }
    },

    mounted() {
      this.getHistoricalRoomOccupationAnalytics()
    },

    methods: {
      async getHistoricalRoomOccupationAnalytics() {
        try {
          this.loading = true
          this.filterBtnState = "loading"
          this.fromDate = this.latestFromDate
          this.toDate = this.latestToDate
          let url = `api/historical-room-analytics?start_date=${this.fromDate}&end_date=${this.toDate}`

          let { data: analytics } = await this.$httpClient.get(url)
          this.historicalRoomAnalytics = analytics
          console.log(this.historicalRoomAnalytics)
          this.loading = false
          this.filterBtnState = "initialize"
        } catch (error) {
          this.loading = false
          this.filterBtnState = "fail-try-again"
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },
    },
  }
</script>

<template>
  <div>
    <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>

    <div class="row">
      <div class="col-12 col-lg-6">
        <DateTimeSelector :from-date-time.sync="latestFromDate" :to-date-time.sync="latestToDate"></DateTimeSelector>
      </div>
      <div class="col-12 col-lg-5">
        <ManagedStateButton
          main-title="Filter / Reload"
          :state="filterBtnState"
          class="px-5 mt-4"
          @clicked="getHistoricalRoomOccupationAnalytics"
        ></ManagedStateButton>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center">
          <b-spinner variant="dark" class="p-5"></b-spinner>
        </div>
        <div v-else>
          <div class="row">
            <div class="col-12">
              <h4
                >Showing number of bookings closed for each type of room between
                <span class="text-info">{{ fromDate | humanDate }}</span> and
                <span class="text-info">{{ toDate | humanDate }}</span></h4
              >
            </div>
          </div>
          <table class="table table-responsive table-hover mt-3">
            <thead class="bg-soft-dark">
              <tr>
                <th>TYPE OF ROOM</th>
                <th>NUMBER OF CLOSED BOOKINGS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="analytics in historicalRoomAnalytics" :key="analytics.name">
                <td>
                  <strong>{{ analytics.name | capitalizeAll }}</strong></td
                >
                <td>{{ analytics.quantity }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
