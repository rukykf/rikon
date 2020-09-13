<script>
  import _ from "lodash"
  import appConfig from "@src/app.config"
  import Layout from "@layouts/main"
  import { DateTime } from "luxon"
  import SuccessFailureAlert from "../../../../components/success-failure-alert"
  import ErrorHandler from "@src/ErrorHandler"
  import ManagedStateButton from "../../../../components/managed-state-button"
  import FormBackground from "../../../../components/form-background"
  import CreditSaleRecord from "../../../../components/credit-sale-record"
  import DateTimeSelector from "@components/date-time-selector"
  import Multiselect from "vue-multiselect"
  import DisplayBookingDetails from "@components/shared/display-booking-details"
  import DisplayOrderItems from "@components/shared/display-order-items"

  /**
   * Starter component
   */
  export default {
    page: {
      title: "Sales",
      meta: [{ name: "description", content: appConfig.description }],
    },
    components: {
      DisplayOrderItems,
      DisplayBookingDetails,
      DateTimeSelector,
      CreditSaleRecord,
      FormBackground,
      ManagedStateButton,
      SuccessFailureAlert,
      Layout,
      Multiselect,
    },
    data() {
      return {
        sales: [],
        filteredSales: [],
        departments: [],
        saleFields: [
          { key: "unique_id", label: "Unique Sales ID", sortable: false, sortDirection: "desc", stickyColumn: true },
          { key: "actions", label: "Actions", sortable: true, sortDirection: "desc" },
          { key: "created_at", label: "Date", sortable: true, sortDirection: "desc" },
          { key: "summary", label: "Sales Summary", sortable: true, sortDirection: "desc" },
          { key: "total_amount", label: "Total Amount", sortable: true, sortDirection: "desc" },
          { key: "total_paid", label: "Total Paid", sortable: true, sortDirection: "desc" },
          { key: "total_due", label: "Total Due", sortable: true, sortDirection: "desc" },
          { key: "total_complementary", label: "Total Complementary", sortable: true, sortDirection: "desc" },
          { key: "status", label: "Status", sortable: true, sortDirection: "desc" },
        ],
        totalRows: 1,
        currentPage: 1,
        perPage: 25,
        pageOptions: [10, 25, 50, 100],
        filter: null,
        filterOn: [],
        sortBy: "age",
        sortDesc: false,
        loading: false,
        selectedSalesRecord: {
          id: null,
          details: null,
          total_amount: null,
          total_paid: null,
          total_complementary: null,
          total_due: 0,
          customer_details: null,
          status: null,
          credit_authorized_by: null,
          merged_records: null,
        },
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
        selectedDepartment: this.$store.state.auth.currentDepartment,
        latestSelectedDepartment: this.$store.state.auth.currentDepartment,
        filterBtnState: "initialize",
        selectedStatus: null,
        success: [],
        errors: [],
      }
    },
    computed: {
      numRows: function() {
        return this.sales.length
      },
      today: function() {
        return DateTime.local().toLocaleString(DateTime.DATE_HUGE)
      },
      totalAmount: function() {
        let sum = 0
        this.filteredSales.forEach((sale) => {
          sum += sale.total_amount
        })
        return sum
      },
      totalPaid: function() {
        let sum = 0
        this.filteredSales.forEach((sale) => {
          sum += sale.total_paid
        })
        return sum
      },
      totalDue: function() {
        let sum = 0
        this.filteredSales.forEach((sale) => {
          sum += sale.total_due
        })
        return sum
      },
      totalComplementary: function() {
        let sum = 0
        this.filteredSales.forEach((sale) => {
          sum += sale.total_complementary
        })
        return sum
      },
    },
    mounted: async function() {
      this.loading = true
      await this.getDepartmentsData()
      await this.getSalesData()
    },
    methods: {
      getSalesData: async function() {
        try {
          this.loading = true
          this.filterBtnState = "loading"

          this.fromDate = this.latestFromDate
          this.toDate = this.latestToDate
          this.selectedDepartment = this.latestSelectedDepartment

          let url = `api/sales?start_date=${this.fromDate}&end_date=${this.toDate}`

          if (this.selectedStatus !== null && this.selectedStatus !== "") {
            url += `&status=${this.selectedStatus}`
          }

          if (this.selectedDepartment.id !== "x") {
            url += `&department_id=${this.selectedDepartment.id}`
          }

          let response = await this.$httpClient.get(url)
          this.sales = response.data
          this.filteredSales = _.cloneDeep(this.sales)
          this.loading = false
          this.filterBtnState = "initialize"
        } catch (error) {
          this.loading = false
          this.filterBtnState = "fail-try-again"
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      getDepartmentsData: async function() {
        try {
          let response = await this.$httpClient.get("api/departments")
          this.departments = [{ id: "x", name: "All Departments" }]
          this.departments.push(...response.data)
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      showSalesRecordModal(salesRecord) {
        this.selectedSalesRecord = salesRecord
        this.$bvModal.show("sales-record")
      },
    },
  }
</script>

<template>
  <Layout>
    <div class="mt-4">
      <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
      <div class="row mt-4">
        <div class="col-12 col-lg-5">
          <DateTimeSelector :from-date-time.sync="latestFromDate" :to-date-time.sync="latestToDate"></DateTimeSelector>
        </div>

        <div class="form-group col-12 col-lg-3">
          <label class="font-weight-bold">
            Department:
          </label>
          <Multiselect
            select-label="click to select"
            deselect-label="click to remove"
            id="department"
            :options="departments"
            track-by="id"
            label="name"
            v-model="latestSelectedDepartment"
          >
          </Multiselect>
        </div>

        <div class="form-group col-12 col-lg-2">
          <label class="font-weight-bold">
            Status:
          </label>
          <select class="form-control" v-model="selectedStatus">
            <option value="">All</option>
            <option value="owing">Owing</option>
            <option value="paid">Paid</option>
            <option value="overpaid">Overpaid</option>
          </select>
        </div>
        <div class="col-12 col-lg-2 mt-1">
          <ManagedStateButton
            main-title="Filter / Reload"
            fail-try-again-title="Filter / Reload"
            :state="filterBtnState"
            class="px-2 mt-4"
            @clicked="getSalesData"
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
                >Sales History for <span class="text-info">{{ selectedDepartment.name | capitalizeAll }}</span> from
                <span class="text-info">{{ fromDate | humanDateWithTime }}</span> to
                <span class="text-info">{{ toDate | humanDateWithTime }}</span></h3
              >
            </div>
            <div v-show="true" class="table-responsive  table-hover mb-0">
              <b-table
                :items="sales"
                :fields="saleFields"
                sticky-header="800px"
                responsive="sm"
                :per-page="perPage"
                :current-page="currentPage"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :filter="filter"
                @filtered="
                  (filteredItems) => {
                    this.filteredSales = filteredItems
                  }
                "
                :filter-included-fields="filterOn"
              >
                <template v-slot:head(total_amount)>
                  <span>Total Sales</span> <br />
                  <span class="text-info mt-1">({{ totalAmount | money }})</span>
                </template>

                <template v-slot:head(total_paid)>
                  <span>Total Paid</span> <br />
                  <span class="text-secondary mt-1">({{ totalPaid | money }})</span>
                </template>

                <template v-slot:head(total_due)>
                  <span>Total Balance Due</span> <br />
                  <span class="text-danger mt-1">({{ totalDue | money }})</span>
                </template>
                <template v-slot:head(total_complementary)>
                  <span>Total Discount / Complementary</span> <br />
                  <span class="text-secondary mt-1">({{ totalComplementary | money }})</span>
                </template>

                <template v-slot:cell(unique_id)="row">
                  <strong> {{ row.item.unique_id }}</strong>
                </template>

                <template v-slot:cell(summary)="row">
                  <DisplayBookingDetails
                    v-if="row.item.sellable_type === 'booking'"
                    :booking="row.item.booking"
                  ></DisplayBookingDetails>
                  <DisplayOrderItems
                    v-if="row.item.sellable_type === 'order'"
                    :order-items="row.item.order.order_items"
                  ></DisplayOrderItems>
                </template>

                <template v-slot:cell(total_amount)="row">
                  {{ row.item.total_amount | money }}
                </template>
                <template v-slot:cell(created_at)="row">
                  {{ row.item.item_created_at | humanDateWithTime }}
                </template>

                <template v-slot:cell(total_due)="row">
                  <span class="text-danger">{{ row.item.total_due | money }}</span>
                </template>
                <template v-slot:cell(total_complementary)="row">
                  {{ row.item.total_complementary | money }}
                </template>
                <template v-slot:cell(total_paid)="row">
                  {{ row.item.total_paid | money }}
                </template>

                <template v-slot:cell(actions)="row">
                  <b-button size="sm" variant="dark" @click="showSalesRecordModal(row.item)" class="mr-2">
                    Show Actions
                  </b-button>
                </template>

                <template v-slot:row-details="row">
                  <div v-if="row.item.credit_authorized_by !== null">
                    <b-row class="mb-2">
                      <b-col cols="12" class="text-center"
                        ><span class="font-weight-bold">Credit Authorized By: </span>
                      </b-col>
                    </b-row>
                    <b-row class="mb-2">
                      <b-col sm="3" class="text-sm-right"><b>Credit Authorized By:</b></b-col>
                      <b-col>{{ row.item.credit_authorized_by.name }}</b-col>
                    </b-row>

                    <b-row class="mb-2">
                      <b-col cols="12" class="text-center"
                        ><span class="font-weight-bold">Customer Details</span>
                      </b-col>
                    </b-row>
                    <b-row class="mb-2">
                      <b-col sm="3" class="text-sm-right"><b>Customer Name:</b></b-col>
                      <b-col>{{ row.item.customer_details.name | capitalize }}</b-col>
                    </b-row>
                    <b-row class="mb-2">
                      <b-col sm="3" class="text-sm-right"><b>Customer Room No:</b></b-col>
                      <b-col>{{ row.item.customer_details.room }}</b-col>
                    </b-row>
                    <b-row class="mb-2">
                      <b-col sm="3" class="text-sm-right"><b>Customer Phone:</b></b-col>
                      <b-col>{{ row.item.customer_details.phone }}</b-col>
                    </b-row>
                  </div>
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
    <b-modal id="sales-record" size="xl" hide-footer header-bg-variant="dark" title="Sales Record">
      <FormBackground>
        <CreditSaleRecord :record="selectedSalesRecord"></CreditSaleRecord>
      </FormBackground>
    </b-modal>
  </Layout>
</template>
