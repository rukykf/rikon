<script>
import appConfig from "@src/app.config"
import Layout from "@layouts/main"
import { DateTime } from "luxon"
import SuccessFailureAlert from "../../../../components/success-failure-alert"
import ErrorHandler from "@src/ErrorHandler"
import ManagedStateButton from "../../../../components/managed-state-button"
import _ from "lodash"
import DisplayCustomerBookingDetails from "./components/display-customer-booking-details"
import DateTimeSelector from "@components/date-time-selector"

/**
 * Starter component
 */
export default {
  page: {
    title: "Bookings",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    DateTimeSelector,
    DisplayCustomerBookingDetails,
    ManagedStateButton,
    SuccessFailureAlert,
    Layout,
  },
  data() {
    return {
      bookings: [],
      filteredBookings: [],
      bookingFields: [
        { key: "unique_id", label: "Booking ID", sortable: false, stickyColumn: true },
        { key: "room.room_no", label: "Room Number", sortable: true, sortDirection: "desc" },
        { key: "show_details", label: "Guest Details", sortable: true, sortDirection: "desc" },
        { key: "actions", label: "Actions", sortable: true, sortDirection: "desc" },
        { key: "start_date", label: "Booking Opened on", sortable: true, sortDirection: "desc" },
        { key: "end_date", label: "Booking Ended on", sortable: true, sortDirection: "desc" },
        { key: "price_per_night", label: "Price per Night", sortable: true, sortDirection: "desc" },
        { key: "num_nights", label: "Number of Nights", sortable: true, sortDirection: "desc" },
        { key: "total_amount", label: "Total Amount", sortable: true, sortDirection: "desc" },
        { key: "status", label: "Booking Status", sortable: true, sortDirection: "desc" },
      ],
      bookingExcelFields: {
        "Room Number": "room.room_no",
        "Guest Name": "customer_details.name",
        "Start Date": "start_date",
        "End Date": "end_date",
        "Price Per Night": "price_per_night",
        "Number of Nights": "num_nights",
        "Total Due": "amount_due",
        Status: "status",
      },
      totalRows: 1,
      currentPage: 1,
      perPage: 25,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "age",
      sortDesc: false,
      loading: false,
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
      filterBtnState: "initialize",
      selectedStatus: "all",
      latestSelectedStatus: "all",
      selectedBookingForCancellation: null,
      success: [],
      errors: [],
    }
  },

  computed: {
    rows: function () {
      return this.bookings.length
    },
    today: function () {
      return DateTime.local().toLocaleString(DateTime.DATE_HUGE)
    },
    totalAmount: function () {
      let sum = 0
      this.filteredBookings.forEach((booking) => {
        sum += booking.amount_due
      })
      return sum
    },
  },

  mounted: function () {
    this.getBookingsData()
  },

  methods: {
    getBookingsData: async function () {
      try {
        this.loading = true
        this.filterBtnState = "loading"

        this.fromDate = this.latestFromDate
        this.toDate = this.latestToDate
        this.selectedStatus = this.latestSelectedStatus

        let url = `api/bookings?start_date=${this.fromDate}&end_date=${this.toDate}`
        if (this.selectedStatus !== null && this.selectedStatus !== "all") {
          url += `&status=${this.selectedStatus}`
        }

        let response = await this.$httpClient.get(url)
        this.bookings = response.data
        this.filteredBookings = _.cloneDeep(this.bookings)
        this.loading = false
        this.filterBtnState = "initialize"
      } catch (error) {
        this.loading = false
        this.filterBtnState = "fail-try-again"
        let errors = ErrorHandler(error)
        this.errors.push(...errors)
      }
    },

    showCancelBookingModal: function (booking) {
      this.selectedBookingForCancellation = booking
      this.$bvModal.show("cancel-booking")
    },

    cancelBooking: async function () {
      try {
        let url = `api/bookings/${this.selectedBookingForCancellation.id}/cancel`
        await this.$httpClient.post(url)
        this.success.push("Successfully cancelled booking")
        this.getBookingsData()
      } catch (error) {
        let errors = ErrorHandler(error)
        this.errors.push(...errors)
      }
    },

    clearCancelBooking: function () {
      this.selectedBookingForCancellation = null
    },
  },
}
</script>

<template>
  <Layout>
    <div class="mt-4">
      <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
      <div class="row mt-4">
        <div class="col-12 col-lg-6">
          <DateTimeSelector :from-date-time.sync="latestFromDate" :to-date-time.sync="latestToDate"></DateTimeSelector>
        </div>
        <div class="form-group col-12 col-lg-3">
          <label class="font-weight-bold">
            Status:
          </label>
          <select class="form-control" v-model="latestSelectedStatus">
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div class="col-12 col-lg-3 mt-1">
          <ManagedStateButton
              main-title="Filter / Reload"
              fail-try-again-title="Filter / Reload"
              :state="filterBtnState"
              class="px-5 mt-4"
              @clicked="getBookingsData"
          ></ManagedStateButton>
        </div>
      </div>

      <div class="card mt-2">
        <div class="card-body">
          <div v-if="loading">
            <div class="text-center my-5">
              <b-spinner variant="primary" label="Spinning" class="p-5"></b-spinner>
            </div>
          </div>
          <div v-else>
            <div class="row mb-md-4">
              <div class="col-sm-12 col-md-6">
                <div class="dataTables_length">
                  <label class="d-inline-flex align-items-center">
                    Show&nbsp;
                    <b-form-select v-model="perPage" size="sm" :options="pageOptions"></b-form-select>&nbsp;entries
                  </label>
                </div>
              </div>
              <!-- Search -->
              <div class="col-sm-12 col-md-6">
                <div class="dataTables_filter text-md-right">
                  <label class="d-inline-flex align-items-center">
                    Search:
                    <b-form-input
                        v-model="filter"
                        type="search"
                        placeholder="Search..."
                        class="form-control form-control-sm ml-2"
                    ></b-form-input>
                  </label>
                </div>
              </div>
              <!-- End search -->
            </div>
            <div class="row mb-3">
              <h3 class="col-12 col-lg-7"
              >Showing <span class="text-info">{{ selectedStatus | capitalizeAll }}</span> Room Bookings from <span
                  class="text-info">{{ fromDate | humanDateWithTime }}</span> to
                <span class="text-info">{{ toDate | humanDateWithTime }}</span></h3
              >
            </div>
            <b-table
                sticky-header="800px"
                :items="bookings"
                :fields="bookingFields"
                responsive="sm"
                :per-page="perPage"
                :current-page="currentPage"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :filter="filter"
                :filter-included-fields="filterOn"
                @filtered="
                (filteredItems) => {
                  this.filteredBookings = filteredItems
                }
              "
            >
              <template v-slot:cell(unique_id)="row">
                <strong>{{ row.item.unique_id }}</strong>
              </template>

              <template v-slot:cell(show_details)="row">
                <b-button size="sm" variant="dark" @click="row.toggleDetails" class="mr-2">
                  {{ row.detailsShowing ? "Hide" : "Show" }} Booking Details
                </b-button>
              </template>

              <template v-slot:cell(actions)="row">
                <b-button
                    size="sm"
                    variant="danger"
                    @click.stop.prevent="showCancelBookingModal(row.item, $event.target)"
                    class="mr-2"
                    v-if="row.item.status === 'open'"
                >
                  Cancel Booking
                </b-button>
              </template>

              <template v-slot:head(total_amount)>
                Total Amount <br/>
                <span class="text-secondary">({{ totalAmount | money }})</span>
              </template>

              <template v-slot:row-details="row">
                <DisplayCustomerBookingDetails :details="row.item"></DisplayCustomerBookingDetails>
              </template>

              <template v-slot:cell(end_date)="row">
                <span v-if="row.item.status !== 'closed'">Still Open</span>
                <span v-else>{{ row.item.end_date | humanDate }}</span>
              </template>


              <template v-slot:cell(start_date)="row">
                <span>{{ row.item.start_date | humanDate }}</span>
              </template>

              <template v-slot:cell(price_per_night)="row">
                <span>{{ row.item.price_per_night | money }}</span>
              </template>

              <template v-slot:cell(total_amount)="row">
                <span>{{ row.item.amount_due | money }}</span>
              </template>
            </b-table>
          </div>
          <div class="row">
            <div class="col">
              <div class="dataTables_paginate paging_simple_numbers float-right">
                <ul class="pagination pagination-rounded mb-0">
                  <!-- pagination -->
                  <b-pagination v-model="currentPage" next-text="next" prev-text="previous" :total-rows="rows" :per-page="perPage"></b-pagination>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <div>
      <b-modal
          id="cancel-booking"
          size="lg"
          @ok="cancelBooking"
          ok-title="Yes"
          cancel-title="No"
          @cancel="clearCancelBooking"
          header-bg-variant="danger"
          title="Are you sure you want to cancel this booking?"
      >
        Are you sure you want to cancel this booking? You cannot undo this action.
      </b-modal>
    </div>
  </Layout>
</template>
