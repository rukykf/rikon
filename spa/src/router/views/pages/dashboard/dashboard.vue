<script>
  import appConfig from "@src/app.config"
  import Layout from "@layouts/main"
  import { DateTime } from "luxon"
  import StatChart from "@components/widget-stat-chart"
  import SuccessFailureAlert from "@components/success-failure-alert"
  import ManagedStateButton from "@components/managed-state-button"
  import ErrorHandler from "@src/ErrorHandler"
  import _ from "lodash"

  import { revenueAreaChart, targetsBarChart } from "./data"

  /**
   * Dashboard-1 Component
   */
  export default {
    page: {
      title: "Dashboard",
      meta: [{ name: "description", content: appConfig.description }],
    },
    components: {
      Layout,
      StatChart,
      SuccessFailureAlert,
      ManagedStateButton,
    },
    data() {
      return {
        fromDate: DateTime.local().toISODate(),
        toDate: DateTime.local().toISODate(),
        pollAnalyticsIntervalId: null,
        errors: [],
        success: [],
        loading: false,
        analyticsData: {},
        filterBtnState: "initialize",
        areaChartOptions: {
          chart: {
            toolbar: {
              show: false,
            },
          },
          tooltip: {
            theme: "dark",
            x: { show: false },
          },
          stroke: {
            curve: "smooth",
            width: 4,
          },
          zoom: {
            enabled: false,
          },
          dataLabels: {
            enabled: false,
          },
          legend: {
            show: false,
          },
          colors: ["#43d39e"],
          xaxis: {
            type: "string",
            categories: [],
            tooltip: {
              enabled: false,
            },
            axisBorder: {
              show: false,
            },
          },
          fill: {
            type: "gradient",
            gradient: {
              type: "vertical",
              shadeIntensity: 1,
              inverseColors: false,
              opacityFrom: 0.45,
              opacityTo: 0.05,
              stops: [45, 100],
            },
          },
        },
        cancelledOrdersSeriesData: [{ name: "Cancelled Orders", data: [] }],
        monthlySalesSeriesData: [{ name: "Sales", data: [] }],
        departmentAnalytics: [],
        revenueAreaChart: revenueAreaChart,
        targetsBarChart: targetsBarChart,
      }
    },

    computed: {
      isToday() {
        return this.fromDate === this.toDate && this.toDate === DateTime.local().toISODate()
      },
    },

    mounted() {
      this.getAnalyticsData()
      // Refresh the analytics every 6 minutes
      this.pollAnalyticsIntervalId = setInterval(() => {
        this.fromDate = DateTime.local().toISODate()
        this.toDate = DateTime.local().toISODate()
        this.getAnalyticsData()
      }, 360000)
    },

    beforeDestroy() {
      clearInterval(this.pollAnalyticsIntervalId)
    },

    methods: {
      async getAnalyticsData() {
        try {
          this.loading = true
          this.filterBtnState = "loading"
          let url = `api/analytics?start_date=${this.fromDate}&end_date=${this.toDate}`
          let response = await this.$httpClient.get(url)
          this.analyticsData = response.data
          let months = []
          let seriesData = []
          this.analyticsData.cancelled_orders_by_month.forEach((stat) => {
            months.push(stat.month)
            seriesData.push(stat.orders)
          })
          this.cancelledOrdersSeriesData[0].data = _.reverse(seriesData)
          this.areaChartOptions.xaxis.categories = _.reverse(months)

          seriesData = []
          this.analyticsData.sales_by_month.forEach((stat) => {
            seriesData.push(stat.sales)
          })
          this.monthlySalesSeriesData[0].data = _.reverse(seriesData)

          this.departmentAnalytics = []
          for (let [department, analytics] of Object.entries(this.analyticsData.analytics_by_department)) {
            analytics.name = department
            this.departmentAnalytics.push(analytics)
          }

          this.loading = false
          this.filterBtnState = "initialize"
        } catch (error) {
          console.log(error)
          this.loading = false
          this.filterBtnState = "fail-try-again"
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      filterAnalytics() {
        if (this.isFilterByDateValid()) {
          this.getAnalyticsData()
        }
      },

      isFilterByDateValid: function() {
        if (this.toDate === null || this.fromDate === null) {
          this.errors.push("Please select a FROM and TO date")
          return false
        }

        if (DateTime.fromISO(this.toDate) >= DateTime.local()) {
          this.errors.push("You cannot get results for a day after today")
          return false
        }

        if (DateTime.fromISO(this.fromDate) > DateTime.fromISO(this.toDate)) {
          this.errors.push("The FROM date must be a day before the TO date")
          return false
        }
        return true
      },
    },
  }
</script>

<template>
  <Layout>
    <div class="page-title align-items-center">
      <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
    </div>

    <div v-if="loading" class="text-center">
      <b-spinner class="p-5"></b-spinner>
    </div>

    <div v-else>
      <div class="row mt-5">
        <div class="col-12">
          <h3>Trends</h3>
        </div>

        <div class="col-12 col-xl-6">
          <div class="card">
            <div class="card-body pb-0">
              <h5 class="card-title mb-0 header-title">Cancelled Orders</h5>
              <apexchart
                type="bar"
                height="296"
                :series="cancelledOrdersSeriesData"
                :options="areaChartOptions"
              ></apexchart>
              <!-- end revenue chart -->
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-6">
          <div class="card">
            <div class="card-body pb-0">
              <h5 class="card-title header-title">Monthly Sales</h5>
              <!-- Target Radialbar chart -->
              <div class="mt-3">
                <apexchart
                  type="bar"
                  height="282"
                  :series="monthlySalesSeriesData"
                  :options="areaChartOptions"
                ></apexchart>
              </div>
              <!-- end target chart -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
