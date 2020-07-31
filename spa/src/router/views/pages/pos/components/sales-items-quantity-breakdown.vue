<script>
  import { DateTime } from "luxon"
  import ErrorHandler from "@src/ErrorHandler"
  import DateTimeSelector from "@components/date-time-selector"
  import ManagedStateButton from "@components/managed-state-button"
  import SuccessFailureAlert from "@components/success-failure-alert"

  export default {
    name: "sales-items-quantity-breakdown",
    components: { SuccessFailureAlert, ManagedStateButton, DateTimeSelector },
    data() {
      return {
        errors: [],
        success: [],
        salesItemsAnalytics: [],
        salesItemsAnalyticsFields: [
          { key: "name", label: "Name", sortable: true },
          { key: "quantity", label: "Quantity Sold", sortable: true },
        ],
        department: this.$store.state.auth.currentDepartment,
        loading: false,
        totalRows: 1,
        currentPage: 1,
        perPage: 25,
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
        pageOptions: [10, 25, 50, 100],
        filter: null,
        filterOn: [],
        filteredOrders: [],
        sortBy: null,
        sortDesc: false,
        filterBtnState: "initialize",
      }
    },

    mounted() {
      this.getSalesItemsAnalytics()
    },

    computed: {
      numRows: function() {
        return this.salesItemsAnalytics.length
      },
    },

    methods: {
      async getSalesItemsAnalytics() {
        try {
          this.loading = true
          this.filterBtnState = "loading"

          this.fromDate = this.latestFromDate
          this.toDate = this.latestToDate

          let url = `api/sales-items-analytics?start_date=${this.fromDate}&end_date=${this.toDate}`

          if (this.department.id !== "x") {
            url += `&department_id=${this.department.id}`
          }
          let response = await this.$httpClient.get(url)
          this.salesItemsAnalytics = response.data
          this.filterBtnState = "initialize"
          this.loading = false
        } catch (error) {
          this.filterBtnState = "fail-try-again"
          this.loading = false
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },
    },
  }
</script>

<template>
  <div>
    <SuccessFailureAlert class="mt-2" :errors="errors" :success="success"></SuccessFailureAlert>
    <div class="row mt-4">
      <div class="col-12 col-lg-6">
        <date-time-selector
          :from-date-time.sync="latestFromDate"
          :to-date-time.sync="latestToDate"
        ></date-time-selector>
      </div>
      <div class="col-12 col-lg-5">
        <ManagedStateButton
          main-title="Filter"
          :state="filterBtnState"
          class="px-5 mt-4"
          @clicked="getSalesItemsAnalytics"
        ></ManagedStateButton>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-body">
        <div v-if="loading" class="text-center">
          <b-spinner variant="dark" class="p-5"></b-spinner>
        </div>

        <div v-else>
          <div class="row">
            <div class="col-12">
              <h4>
                Showing <strong>Quantity of Items Sold</strong> by
                <span class="text-info">{{ department.name | capitalizeAll }}</span> from
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
          <div class="table-responsive  table-hover mb-0">
            <b-table
              :items="salesItemsAnalytics"
              :fields="salesItemsAnalyticsFields"
              responsive="sm"
              :per-page="perPage"
              :current-page="currentPage"
              :sort-by.sync="sortBy"
              :sort-desc.sync="sortDesc"
              sticky-header="800px"
              :filter="filter"
              :filter-included-fields="filterOn"
            >
              <template v-slot:cell(name)="row">
                {{ row.item.name | capitalizeAll }}
              </template>
            </b-table>
          </div>
          <div class="row">
            <div class="col">
              <div class="dataTables_paginate paging_simple_numbers float-right">
                <ul class="pagination pagination-rounded mb-0">
                  <!-- pagination -->
                  <b-pagination v-model="currentPage" :total-rows="numRows" :per-page="perPage"></b-pagination>
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
