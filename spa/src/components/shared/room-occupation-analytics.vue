<script>
  import ErrorHandler from "@src/ErrorHandler"
  import SuccessFailureAlert from "@components/success-failure-alert"
  import ManagedStateButton from "@components/managed-state-button"

  export default {
    name: "room-occupation-analytics",
    components: { ManagedStateButton, SuccessFailureAlert },
    data() {
      return {
        loading: false,
        filterBtnState: "initialize",
        errors: [],
        success: [],
        roomAnalytics: [],
      }
    },

    mounted() {
      this.getCurrentRoomOccupationAnalyticsData()
    },

    methods: {
      async getCurrentRoomOccupationAnalyticsData() {
        try {
          this.loading = true
          this.filterBtnState = "loading"
          let url = `api/current-room-analytics`

          let { data: roomAnalytics } = await this.$httpClient.get(url)

          this.roomAnalytics = roomAnalytics
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
      <div class="col-12 col-lg-5">
        <ManagedStateButton
          main-title="Reload"
          fail-try-again-title="Reload"
          :state="filterBtnState"
          class="px-5 mt-4"
          @clicked="getCurrentRoomOccupationAnalyticsData"
        ></ManagedStateButton>
      </div>
    </div>
    <div class="card mt-4">
      <div class="card-body">
        <div v-if="loading" class="text-center">
          <b-spinner variant="dark" class="p-5"></b-spinner>
        </div>

        <table v-else class="table table-responsive table-hover">
          <thead class="bg-soft-dark">
            <tr>
              <th>TYPE OF ROOM</th>
              <th>NUMBER OF CURRENTLY OCCUPIED ROOMS</th>
              <th>NUMBER OF UNOCCUPIED ROOMS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="analytics in roomAnalytics" :key="analytics.name">
              <td>
                <strong>{{ analytics.name | capitalizeAll }}</strong></td
              >
              <td>{{ analytics.num_occupied_rooms }}</td>
              <td>{{ analytics.num_unoccupied_rooms }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
