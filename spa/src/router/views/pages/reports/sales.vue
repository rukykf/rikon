<script>
import appConfig from "@src/app.config"
import Layout from "@layouts/main"
import { DateTime } from "luxon"
import StateButton from "../../../../components/state-button"
import SuccessFailureAlert from "../../../../components/success-failure-alert"
import axios from "axios"
import JsonExcel from "vue-json-excel"
import { formatMoney } from "accounting-js"

/**
 * Starter component
 */
export default {
	page: {
		title: "Sales",
		meta: [{ name: "description", content: appConfig.description }],
	},
	components: {
		SuccessFailureAlert,
		StateButton,
		Layout,
		JsonExcel,
	},
	data() {
		return {
			sales: [],
			saleFields: [
				{ key: "SN", label: "S/N", sortable: false, sortDirection: "desc" },
				{ key: "dateCreated", label: "Date Created", sortable: true, sortDirection: "desc" },
				{ key: "totalDue", label: "Total Due", sortable: true, sortDirection: "desc" },
				{ key: "totalPaid", label: "Total Paid", sortable: true, sortDirection: "desc" },
				{ key: "balanceDue", label: "Balance Due", sortable: true, sortDirection: "desc" },
				{ key: "forgivenDebt", label: "Forgiven Debt", sortable: true, sortDirection: "desc" },
				{ key: "status", label: "Status", sortable: true, sortDirection: "desc" },
				{ key: "showDetails", label: "Show Customer and Order Details", sortable: true, sortDirection: "desc" },
			],
			saleExcelFields: {
				Date: "dateCreated",
				"Total Due": "totalDue",
				"Total Paid": "totalPaid",
				"Balance Due": "balanceDue",
				"Forgiven Debt": "forgivenDebt",
				Status: "status",
				"Customer Details": "customerInfo",
				"Order Details": "details",
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
			filterBtn: {
				title: "Filter",
				icon: "none",
				disabled: false,
				variant: "primary",
				loading: false,
			},
			fromDate: null,
			toDate: null,
			selectedStatus: null,
			success: [],
			errors: [],
		}
	},
	computed: {
		rows: function() {
			return this.sales.length
		},
		today: function() {
			return DateTime.local().toLocaleString(DateTime.DATE_HUGE)
		},
		totalDue: function() {
			let sum = 0
			this.sales.forEach((sale) => {
				sum += sale.totalDue
			})
			return formatMoney(sum, { symbol: "N", precision: 0 })
		},
		totalPaid: function() {
			let sum = 0
			this.sales.forEach((sale) => {
				sum += sale.totalPaid
			})
			return formatMoney(sum, { symbol: "N", precision: 0 })
		},
		totalBalanceDue: function() {
			let sum = 0
			this.sales.forEach((sale) => {
				sum += sale.balanceDue
			})
			return formatMoney(sum, { symbol: "N", precision: 0 })
		},
		totalForgivenDebt: function() {
			let sum = 0
			this.sales.forEach((sale) => {
				sum += sale.forgivenDebt
			})
			return formatMoney(sum, { symbol: "N", precision: 0 })
		},
	},
	mounted: function() {
		this.loading = true
		setTimeout(() => {
			this.getData()
		}, 1500)
	},
	methods: {
		filterSales: function() {
			if (this.isFilterByDateValid()) {
				this.loading = true
				this.filterBtn.loading = true
				setTimeout(() => {
					this.getData()
				}, 1000)
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
		getData: async function() {
			let history = await axios.get("http://localhost:3000/sales")
			this.sales = history.data
			this.loading = false
		},
		formatSaleItem(money) {
			if (money === 0) {
				return formatMoney(money, { symbol: "N", precision: 2 })
			}
			return formatMoney(money, { symbol: "N", precision: 0 })
		},
	},
}
</script>

<template>
	<Layout>
		<div class="mt-4">
			<SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
			<div class="row mt-4">
				<div class="form-group col-12 col-lg-3">
					<label class="font-weight-bold">
						From
					</label>
					<input type="date" class="form-control" v-model="fromDate" />
				</div>

				<div class="form-group col-12 col-lg-3">
					<label class="font-weight-bold">
						To:
					</label>
					<input type="date" class="form-control" v-model="toDate" />
				</div>
				<div class="form-group col-12 col-lg-3">
					<label class="font-weight-bold">
						Status:
					</label>
					<select class="form-control" v-model="selectedStatus">
						<option value="paid">Fully Paid</option>
						<option value="discounted">Discounted</option>
						<option value="complementary">Complementary</option>
						<option value="pending">Pending</option>
					</select>
				</div>
				<div class="col-12 col-lg-3 mt-1">
					<StateButton :buttonState="filterBtn" class="px-5 mt-4" @clicked="filterSales"></StateButton>
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
								>Sales History from <span class="text-info">March 1st, 2020</span> to
								<span class="text-info">{{ today }}</span></h3
							>

							<div class="col-12 col-lg-5 text-right">
								<JsonExcel
									class="btn btn-dark mb-1"
									:data="sales"
									:fields="saleExcelFields"
									worksheet="Rikon Sales"
									name="rikon-sales-history.xls"
								>
									<i class="uil uil-chart-line mr-3"></i> Export to Excel
								</JsonExcel>
							</div>
						</div>
						<div v-show="true" class="table-responsive  table-hover mb-0">
							<b-table
								:items="sales"
								:fields="saleFields"
								responsive="sm"
								:per-page="perPage"
								:current-page="currentPage"
								:sort-by.sync="sortBy"
								:sort-desc.sync="sortDesc"
								:filter="filter"
								:filter-included-fields="filterOn"
							>
								<template v-slot:head(totalDue)>
									<span>Total Sales</span> <br />
									<span class="text-info mt-1">(N2,475,000)</span>
								</template>

								<template v-slot:head(totalPaid)>
									<span>Total Paid</span> <br />
									<span class="text-secondary mt-1">({{ totalPaid }})</span>
								</template>

								<template v-slot:head(balanceDue)>
									<span>Total Balance Due</span> <br />
									<span class="text-danger mt-1">({{ totalBalanceDue }})</span>
								</template>
								<template v-slot:head(forgivenDebt)>
									<span>Total Forgiven Debt</span> <br />
									<span class="text-secondary mt-1">({{ totalForgivenDebt }})</span>
								</template>

								<template v-slot:cell(SN)="row">
									{{ row.index + 1 }}
								</template>
								<template v-slot:cell(totalDue)="row">
									{{ row.item.totalDue | money }}
								</template>
								<template v-slot:cell(totalPaid)="row">
									{{ formatSaleItem(row.item.totalPaid) }}
								</template>
								<template v-slot:cell(balanceDue)="row">
									<span class="text-danger">{{ formatSaleItem(row.item.balanceDue) }}</span>
								</template>
								<template v-slot:cell(forgivenDebt)="row">
									{{ formatSaleItem(row.item.forgivenDebt) }}
								</template>

								<template v-slot:cell(showDetails)="row">
									<b-button size="sm" variant="dark" @click="row.toggleDetails" class="mr-2">
										{{ row.detailsShowing ? "Hide" : "Show" }} Details
									</b-button>
								</template>

								<template v-slot:row-details="row">
									<b-row class="mb-2">
										<b-col sm="3" class="text-sm-right"><b>Customer Info:</b></b-col>
										<b-col>{{ row.item.customerInfo }}</b-col>
									</b-row>

									<b-row class="mb-2">
										<b-col sm="3" class="text-sm-right"><b>Order Details:</b></b-col>
										<b-col>{{ row.item.details }}</b-col>
									</b-row>
								</template>
							</b-table>
						</div>
						<div class="row">
							<div class="col">
								<div class="dataTables_paginate paging_simple_numbers float-right">
									<ul class="pagination pagination-rounded mb-0">
										<!-- pagination -->
										<b-pagination v-model="currentPage" :total-rows="rows" :per-page="perPage"></b-pagination>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Layout>
</template>
