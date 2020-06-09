<script>
import appConfig from "@src/app.config"
import Layout from "@layouts/main"
import { DateTime } from "luxon"
import SuccessFailureAlert from "../../../../components/success-failure-alert"
import JsonExcel from "vue-json-excel"
import ErrorHandler from "@src/ErrorHandler"
import ManagedStateButton from "../../../../components/managed-state-button"
import FormBackground from "../../../../components/form-background"
import CreditSaleRecord from "../../../../components/credit-sale-record"

/**
 * Starter component
 */
export default {
	page: {
		title: "Sales",
		meta: [{ name: "description", content: appConfig.description }],
	},
	components: {
		CreditSaleRecord,
		FormBackground,
		ManagedStateButton,
		SuccessFailureAlert,
		Layout,
		JsonExcel,
	},
	data() {
		return {
			sales: [],
			saleFields: [
				{ key: "SN", label: "S/N", sortable: false, sortDirection: "desc" },
				{ key: "showDetails", label: "Show Customer and Order Details", sortable: true, sortDirection: "desc" },
				{ key: "actions", label: "Actions", sortable: true, sortDirection: "desc" },
				{ key: "created_at", label: "Date Created", sortable: true, sortDirection: "desc" },
				{ key: "updated_at", label: "Date Last Modified", sortable: true, sortDirection: "desc" },
				{ key: "total_amount", label: "Total Amount", sortable: true, sortDirection: "desc" },
				{ key: "total_paid", label: "Total Paid", sortable: true, sortDirection: "desc" },
				{ key: "total_due", label: "Total Due", sortable: true, sortDirection: "desc" },
				{ key: "total_complementary", label: "Total Complementary", sortable: true, sortDirection: "desc" },
				{ key: "status", label: "Status", sortable: true, sortDirection: "desc" },
			],
			saleExcelFields: {
				"Date Created": "created_at",
				"Total Sales Amount": "total_amount",
				"Total Paid": "total_paid",
				"Total Balance Due": "total_due",
				"Total Complementary / Forgiven Debt": "total_complementary",
				Status: "status",
				"Customer Name": "customer_details.name",
				"Customer Phone": "customer_details.phone",
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
				.minus({ days: 90 })
				.toISODate(),
			toDate: DateTime.local().toISODate(),
			filterBtnState: "initialize",
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
		totalAmount: function() {
			let sum = 0
			this.sales.forEach((sale) => {
				sum += sale.total_amount
			})
			return sum
		},
		totalPaid: function() {
			let sum = 0
			this.sales.forEach((sale) => {
				sum += sale.total_paid
			})
			return sum
		},
		totalDue: function() {
			let sum = 0
			this.sales.forEach((sale) => {
				sum += sale.total_due
			})
			return sum
		},
		totalComplementary: function() {
			let sum = 0
			this.sales.forEach((sale) => {
				sum += sale.total_complementary
			})
			return sum
		},
	},
	mounted: function() {
		this.getSalesData()
	},
	methods: {
		getSalesData: async function() {
			try {
				this.loading = true
				this.filterBtnState = "loading"
				let url = `api/sales?start_date=${this.fromDate}&end_date=${this.toDate}`
				if (this.selectedStatus !== null && this.selectedStatus !== "") {
					url += `&status=${this.selectedStatus}`
				}

				let response = await this.$httpClient.get(url)
				this.sales = response.data
				this.loading = false
				this.filterBtnState = "initialize"
			} catch (error) {
				this.loading = false
				this.filterBtnState = "fail-try-again"
				let errors = ErrorHandler(error)
				this.errors.push(...errors)
			}
		},
		filterSales: function() {
			if (this.isFilterByDateValid()) {
				this.getSalesData()
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
				<div class="form-group col-12 col-lg-3">
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
				<div class="col-12 col-lg-3 mt-1">
					<ManagedStateButton
						main-title="Filter"
						:state="filterBtnState"
						class="px-5 mt-4"
						@clicked="filterSales"
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
								>Sales History from <span class="text-info">{{ fromDate | humanDate }}</span> to
								<span class="text-info">{{ toDate | humanDate }}</span></h3
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
									<span>Total Forgiven Debt</span> <br />
									<span class="text-secondary mt-1">({{ totalComplementary | money }})</span>
								</template>

								<template v-slot:cell(SN)="row">
									{{ row.index + 1 }}
								</template>
								<template v-slot:cell(total_amount)="row">
									{{ row.item.total_amount | money }}
								</template>
								<template v-slot:cell(updated_at)="row">
									{{ row.item.updated_at | humanDate }}
								</template>
								<template v-slot:cell(created_at)="row">
									{{ row.item.created_at | humanDate }}
								</template>
								<template v-slot:cell(customer_details)="row">
									{{ row.item.customer_details.name | capitalize }}
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

								<template v-slot:cell(showDetails)="row">
									<b-button size="sm" variant="dark" @click="row.toggleDetails" class="mr-2">
										{{ row.detailsShowing ? "Hide" : "Show" }} Details
									</b-button>
								</template>

								<template v-slot:cell(actions)="row">
									<b-button size="sm" variant="dark" @click="showSalesRecordModal(row.item)" class="mr-2">
										Show Actions
									</b-button>
								</template>

								<template v-slot:row-details="row">
									<div v-if="row.item.credit_authorized_by !== null">
										<b-row class="mb-2">
											<b-col cols="12" class="text-center"><span class="font-weight-bold">Credit Authorized By: </span> </b-col>
										</b-row>
										<b-row class="mb-2">
											<b-col sm="3" class="text-sm-right"><b>Credit Authorized By:</b></b-col>
											<b-col>{{ row.item.credit_authorized_by.name }}</b-col>
										</b-row>

										<b-row class="mb-2">
											<b-col cols="12" class="text-center"><span class="font-weight-bold">Customer Details</span> </b-col>
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
										<b-pagination v-model="currentPage" :total-rows="rows" :per-page="perPage"></b-pagination>
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
