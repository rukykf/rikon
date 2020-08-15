<script>
  import { DateTime } from "luxon"
  import _ from "lodash"
  import ErrorHandler from "@src/ErrorHandler"
  import SuccessFailureAlert from "@components/success-failure-alert"
  import DateTimeSelector from "@components/date-time-selector"
  import ManagedStateButton from "@components/managed-state-button"
  import DisplayBookingDetails from "@components/shared/display-booking-details"
  import DisplayCustomerBookingDetails from "@views/pages/reports/components/display-customer-booking-details"
  import DisplayRecordActionsBtn from "@components/shared/display-record-actions-btn"

  export default {
    name: "booking-history",
    components: {
      DisplayRecordActionsBtn,
      DisplayCustomerBookingDetails,
      DisplayBookingDetails,
      ManagedStateButton,
      DateTimeSelector,
      SuccessFailureAlert,
    },
    data() {
      return {
        errors: [],
        success: [],
        loading: false,
        bookings: [],
        bookingFields: [
          { key: "unique_id", label: "Computer Gen. ID", sortable: true, stickyColumn: true },
          { key: "date", label: "Booking Started On", sortable: true },
          { key: "summary", label: "Booking Summary", sortable: true },
          { key: "showDetails", label: "More Details", sortable: false },
          { key: "showActions", label: "Actions", sortable: false },
          { key: "total_amount", label: "Total Amount", sortable: true },
          { key: "total_paid", label: "Total Paid", sortable: true },
          { key: "total_discount", label: "Total Discount", sortable: true },
          { key: "total_debt", label: "Debt", sortable: true },
        ],
        filteredBookings: [],
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
        totalRows: 1,
        currentPage: 1,
        perPage: 25,
        pageOptions: [5, 10, 25, 50, 100],
        filter: null,
        filterOn: [],
        filteredOrders: [],
        sortBy: null,
        sortDesc: false,
      }
    },
    computed: {
      numRows: function() {
        return this.bookings.length
      },

      totalAmount: function() {
        let sum = 0
        this.filteredBookings.forEach((booking) => {
          sum += booking.sale.total_amount
        })
        return sum
      },

      totalPaid: function() {
        let sum = 0
        this.filteredBookings.forEach((booking) => {
          sum += booking.sale.total_paid
        })
        return sum
      },

      totalDiscount: function() {
        let sum = 0
        this.filteredBookings.forEach((booking) => {
          sum += booking.sale.total_complementary
        })
        return sum
      },

      totalDebt: function() {
        let sum = 0
        this.filteredBookings.forEach((booking) => {
          sum += booking.sale.total_due
        })
        return sum
      },
    },
    mounted() {
      this.getBookingsData()
    },

    methods: {
      async getBookingsData() {
        try {
          this.loading = true
          this.filterBtnState = "loading"
          this.fromDate = this.latestFromDate
          this.toDate = this.latestToDate

          let url = `api/bookings?start_date=${this.fromDate}&end_date=${this.toDate}&status=closed`
          let { data: bookings } = await this.$httpClient.get(url)

          this.bookings = bookings
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
          @clicked="getBookingsData"
        ></ManagedStateButton>
      </div>
    </div>

    <div class="card mt-3">
      <div class="card-body">
        <div v-if="loading" class="text-center">
          <b-spinner variant="dark" class="p-5"></b-spinner>
        </div>

        <div v-else>
          <div class="row">
            <div class="col-12">
              <h4>
                Showing <strong>ALL CLOSED</strong> Bookings from
                <span class="text-info">{{ fromDate | humanDateWithTime }}</span> to
                <span class="text-info">{{ toDate | humanDateWithTime }}</span></h4
              >
            </div></div
          >
          <div class="row mb-md-4 mt-5">
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
          <div class="table-responsive table-hover mb-0">
            <b-table
              :items="bookings"
              :fields="bookingFields"
              responsive="sm"
              :per-page="perPage"
              :current-page="currentPage"
              :sort-by.sync="sortBy"
              :sort-desc.sync="sortDesc"
              @filtered="
                (filteredItems) => {
                  this.filteredBookings = filteredItems
                }
              "
              sticky-header="800px"
              :filter="filter"
              :filter-included-fields="filterOn"
            >
              <template v-slot:cell(unique_id)="row">
                <strong>{{ row.item.sale.unique_id }}</strong>
              </template>

              <template v-slot:cell(date)="row">
                {{ row.item.created_at | humanDateWithTime }}
              </template>

              <template v-slot:cell(summary)="row">
                <DisplayBookingDetails :booking="row.item"></DisplayBookingDetails>
              </template>

              <template v-slot:cell(showDetails)="row">
                <b-button size="sm" variant="dark" @click="row.toggleDetails" class="mr-2">
                  {{ row.detailsShowing ? "Hide" : "Show" }} More Details
                </b-button>
              </template>

              <template v-slot:row-details="row">
                <DisplayCustomerBookingDetails :details="row.item"></DisplayCustomerBookingDetails>
              </template>

              <template v-slot:cell(showActions)="row">
                <DisplayRecordActionsBtn :record="row.item" type="booking"></DisplayRecordActionsBtn>
              </template>

              <template v-slot:head(total_amount)="row">
                Total Amount <br />
                <span class="text-secondary">({{ totalAmount | money }})</span>
              </template>

              <template v-slot:cell(total_amount)="row">
                {{ row.item.sale.total_amount | money }}
              </template>

              <template v-slot:head(total_paid)="row">
                Total Paid <br />
                <span class="text-secondary">({{ totalPaid | money }})</span>
              </template>

              <template v-slot:cell(total_paid)="row">
                {{ row.item.sale.total_paid | money }}
              </template>

              <template v-slot:head(total_discount)="row">
                Total Discount <br />
                <span class="text-secondary">({{ totalDiscount | money }})</span>
              </template>

              <template v-slot:cell(total_discount)="row">
                {{ row.item.sale.total_complementary | money }}
              </template>

              <template v-slot:head(total_debt)="row">
                Total Debt <br />
                <span class="text-danger">({{ totalDebt | money }})</span>
              </template>

              <template v-slot:cell(total_debt)="row">
                {{ row.item.sale.total_due | money }}
              </template>
            </b-table>
          </div>
          <div class="row">
            <div class="col">
              <div class="dataTables_paginate paging_simple_numbers float-right">
                <ul class="pagination pagination-rounded mb-0">
                  <!-- pagination -->
                  <b-pagination
                    next-text="next"
                    prev-text="previous"
                    v-model="currentPage"
                    :total-rows="numRows"
                    :per-page="perPage"
                  ></b-pagination>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
