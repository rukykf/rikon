<script>
  import { DateTime } from "luxon"
  import ErrorHandler from "@src/ErrorHandler"
  import SuccessFailureAlert from "@components/success-failure-alert"
  import DateTimeSelector from "@components/date-time-selector"
  import ManagedStateButton from "@components/managed-state-button"
  import WidgetStatChart from "@components/widget-stat-chart"
  import Multiselect from "vue-multiselect"

  export default {
    name: "cash-pos-debt-sales-breakdown",
    components: { WidgetStatChart, ManagedStateButton, DateTimeSelector, SuccessFailureAlert, Multiselect },
    props: {
      showDepartmentFilter: {
        type: Boolean,
        default: false,
      },
    },

    data() {
      return {
        loading: false,
        filterBtnState: "initialize",
        salesBreakdownAnalyticsData: {},
        errors: [],
        success: [],
        selectedDepartment: this.$store.state.auth.currentDepartment,
        latestSelectedDepartment: this.$store.state.auth.currentDepartment,
        departments: [],
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
    async mounted() {
      await this.getDepartmentsData()
      this.getSalesBreakdownData()
    },

    methods: {
      async getSalesBreakdownData() {
        try {
          this.loading = true
          this.filterBtnState = "loading"
          this.fromDate = this.latestFromDate
          this.toDate = this.latestToDate
          this.selectedDepartment = this.latestSelectedDepartment

          let url = `api/department-analytics?start_date=${this.fromDate}&end_date=${this.toDate}`

          if (this.selectedDepartment.id !== "x") {
            url += `&department_id=${this.selectedDepartment.id}`
          }

          let response = await this.$httpClient.get(url)

          this.salesBreakdownAnalyticsData = response.data
          this.loading = false
          this.filterBtnState = "initialize"
        } catch (error) {
          this.loading = false
          this.filterBtnState = "fail-try-again"
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      async getDepartmentsData() {
        try {
          let response = await this.$httpClient.get("api/departments")
          this.departments = [{ id: "x", name: "All Departments" }]
          this.departments.push(...response.data)
        } catch (error) {
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
    <div class="row">
      <div class="col-12 col-lg-6">
        <date-time-selector
          :from-date-time.sync="latestFromDate"
          :to-date-time.sync="latestToDate"
        ></date-time-selector>
      </div>
      <div v-if="showDepartmentFilter" class="form-group col-12 col-lg-3">
        <label class="font-weight-bold">
          Department:
        </label>
        <Multiselect
          id="department"
          :options="departments"
          track-by="id"
          label="name"
          v-model="latestSelectedDepartment"
          select-label="click to select"
          deselect-label="click to remove"
        >
        </Multiselect>
      </div>
      <div class="col-12 col-lg-3">
        <ManagedStateButton
          main-title="Filter / Reload"
          fail-try-again-title="Filter / Reload"
          :state="filterBtnState"
          class="px-4 mt-4"
          @clicked="getSalesBreakdownData"
        ></ManagedStateButton>
      </div>
    </div>

    <div v-if="loading" class="text-center">
      <b-spinner variant="dark" class="p-5"></b-spinner>
    </div>

    <div v-else>
      <div class="row mt-4">
        <div class="col-12">
          <h4>
            Showing <strong>Sales Breakdown</strong> for
            <span class="text-info">{{ selectedDepartment.name | capitalizeAll }}</span> from
            <span class="text-info">{{ fromDate | humanDateWithTime }}</span> to
            <span class="text-info">{{ toDate | humanDateWithTime }}</span></h4
          >
        </div></div
      >
      <div class="row mt-4">
        <b-card class="col-12 col-lg-8 mx-2">
          <b-card-body>
            <h4>TOTAL SALES: {{ salesBreakdownAnalyticsData.totalSales | money }}</h4>
          </b-card-body>
        </b-card>
        <widget-stat-chart
          main-title="Cash"
          :value="salesBreakdownAnalyticsData.totalCashSales"
          class="col-12 col-lg-4 mx-2"
          is-money
        ></widget-stat-chart>

        <widget-stat-chart
          main-title="POS"
          :value="salesBreakdownAnalyticsData.totalPOSSales"
          class="col-12 col-lg-4 mx-2"
          is-money
        ></widget-stat-chart>

        <widget-stat-chart
          main-title="Transfer"
          :value="salesBreakdownAnalyticsData.totalTransferSales"
          class="col-12 col-lg-4 mx-2"
          is-money
        ></widget-stat-chart>
        <widget-stat-chart
          main-title="Discount"
          :value="salesBreakdownAnalyticsData.totalDiscount"
          class="col-12 col-lg-4 mx-2"
          is-money
        ></widget-stat-chart>
        <widget-stat-chart
          main-title="Complementary"
          :value="salesBreakdownAnalyticsData.totalComplementary"
          class="col-12 col-lg-4 mx-2"
          is-money
        ></widget-stat-chart>
        <widget-stat-chart
          main-title="Debt"
          :value="salesBreakdownAnalyticsData.totalDebt"
          class="col-12 col-lg-4 mx-2"
          is-money="true"
        ></widget-stat-chart>
        <widget-stat-chart
          main-title="Company"
          :value="salesBreakdownAnalyticsData.totalCompany"
          class="col-12 col-lg-4 mx-2"
          is-money
        ></widget-stat-chart>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
