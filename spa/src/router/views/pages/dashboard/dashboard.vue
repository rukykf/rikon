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

			<div class="row">
				<div class="col-12 col-sm-4 col-lg-6">
					<h3 class="mb-1 mt-0">
						<span v-if="isToday">Today's Summary</span>
						<span v-else
							>Rikon Analytics from <span class="text-info">{{ fromDate | humanDate }}</span> to
							<span class="text-info">{{ toDate | humanDate }}</span></span
						>
					</h3>
				</div>
			</div>

			<div class="row mb-5 mt-2">
				<div class="form-group col-12 col-lg-3">
					<label class="font-weight-bold">
						From:
					</label>
					<input type="date" class="form-control" v-model="fromDate" />
				</div>

				<div class="form-group col-12 col-lg-3">
					<label class="font-weight-bold">
						To:
					</label>
					<input type="date" class="form-control" v-model="toDate" />
				</div>
				<div class="col-12 col-lg-3 mt-1">
					<ManagedStateButton
						main-title="Filter"
						:state="filterBtnState"
						class="px-5 mt-4"
						@clicked="filterAnalytics"
					></ManagedStateButton>
				</div>
			</div>
		</div>

		<div v-if="loading" class="text-center">
			<b-spinner class="p-5"></b-spinner>
		</div>

		<div v-else>
			<div class="row">
				<div class="col-12">
					<h3>Analytics Overview</h3>
				</div>

				<div v-for="stat of analyticsData.statCards" :key="stat.mainTitle" class="col-12 col-md-6 col-xl-3">
					<StatChart :main-title="stat.mainTitle" :value="stat.value" :isMoney="stat.isMoney" />
				</div>
			</div>

			<div class="row mt-5">
				<div class="col-12">
					<h3>Trends</h3>
				</div>

				<div class="col-12 col-xl-6">
					<div class="card">
						<div class="card-body pb-0">
							<h5 class="card-title mb-0 header-title">Cancelled Orders</h5>
							<apexchart type="bar" height="296" :series="cancelledOrdersSeriesData" :options="areaChartOptions"></apexchart>
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
								<apexchart type="bar" height="282" :series="monthlySalesSeriesData" :options="areaChartOptions"></apexchart>
							</div>
							<!-- end target chart -->
						</div>
					</div>
				</div>
			</div>

			<div class="row mt-5">
				<div class="col-12">
					<h3>Department Analytics</h3>
				</div>

				<div class="col-12">
					<div class="card">
						<div class="card-body pb-0">
							<h5 class="card-title header-title"
								>Department Analytics from <span class="text-info">{{ fromDate | humanDate }}</span> to
								<span class="text-info">{{ toDate | humanDate }}</span>
							</h5>

							<table class="table table-responsive table-hover">
								<thead>
									<tr>
										<th>Department Name</th>
										<th>Pending Orders</th>
										<th>Fulfilled Orders</th>
										<th>Sales <br /><span class="text-secondary">(for fulfilled orders)</span></th>
										<th>Cancelled Orders</th>
										<th>Lost Sales <br /><span class="text-secondary">(for cancelled orders)</span></th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="analytics in departmentAnalytics" :key="analytics.name">
										<td>{{ analytics.name | capitalize }}</td>
										<td>{{ analytics.total_pending_orders }}</td>
										<td>{{ analytics.total_fulfilled_orders }}</td>
										<td>{{ analytics.total_sales | money }}</td>
										<td>{{ analytics.total_cancelled_orders }}</td>
										<td>{{ analytics.total_lost_sales | money }}</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			<div class="row mt-5">
				<div class="col-12">
					<h3>Sales Items Analytics</h3>
				</div>

				<div class="col-12">
					<div class="card">
						<div class="card-body pb-0">
							<h5 class="card-title header-title"
								>Sales Item Analytics from <span class="text-info">{{ fromDate | humanDate }}</span> to
								<span class="text-info">{{ toDate | humanDate }}</span>
							</h5>

							<table class="table table-responsive table-hover">
								<thead>
									<tr>
										<th>Item Name</th>
										<th>Total Quantity <br /><span class="text-secondary">(for all orders)</span></th>
										<th>Total Quantity <br /><span class="text-secondary">(for fulfilled orders)</span></th>
										<th>Sales <br /><span class="text-secondary">(for fulfilled orders)</span></th>
										<th>Total Quantity <br /><span class="text-secondary">(for cancelled orders)</span></th>
										<th>Lost Sales <br /><span class="text-secondary">(for cancelled orders)</span></th>
										<th
											>Total Quantity <br />
											for Currently Pending Orders</th
										>
									</tr>
								</thead>
								<tbody>
									<tr v-for="analytics in analyticsData.analytics_by_sales_item">
										<td>{{ analytics.name | capitalize }}</td>
										<td>{{ analytics.total_quantity_ordered }}</td>
										<td>{{ analytics.total_quantity_sold }}</td>
										<td>{{ analytics.total_sales | money }}</td>
										<td>{{ analytics.total_quantity_of_lost_sales }}</td>
										<td>{{ analytics.total_lost_sales | money }}</td>
										<td>{{
											analytics.total_quantity_ordered - (analytics.total_quantity_sold + analytics.total_quantity_of_lost_sales)
										}}</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Layout>
</template>
