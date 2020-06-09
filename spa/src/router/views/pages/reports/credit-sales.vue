<script>
  import appConfig from "@src/app.config"
  import Layout from "@layouts/main"
  import {DateTime} from "luxon"
  import SuccessFailureAlert from "../../../../components/success-failure-alert"
  import JsonExcel from "vue-json-excel"
  import CreditSaleRecord from "@components/credit-sale-record"
  import FormBackground from "../../../../components/form-background"
  import ErrorHandler from "@src/ErrorHandler"
  import ManagedStateButton from "../../../../components/managed-state-button";
  import _ from "lodash"

  /**
   * Starter component
   */
  export default {
    page: {
      title: "Credit Sales",
      meta: [{name: "description", content: appConfig.description}],
    },
    components: {
      ManagedStateButton,
      FormBackground,
      SuccessFailureAlert,
      Layout,
      JsonExcel,
      CreditSaleRecord
    },
    data() {
      return {
        sales: [],
        saleFields: [
          {key: "selected", label: "Selected", sortable: false, sortDirection: "desc"},
          {key: "SN", label: "S/N", sortable: false, sortDirection: "desc"},
          {key: "showDetails", label: "Show Sales Details", sortable: true, sortDirection: "desc"},
          {key: "actions", label: "Actions", sortable: true, sortDirection: "desc"},
          {key: "customer_details", label: "Customer Name", sortable: true, sortDirection: "desc"},
          {key: "created_at", label: "Date Created", sortable: true, sortDirection: "desc"},
          {key: "updated_at", label: "Date Last Modified", sortable: true, sortDirection: "desc"},
          {key: "total_amount", label: "Total Amount", sortable: true, sortDirection: "desc"},
          {key: "total_paid", label: "Total Paid", sortable: true, sortDirection: "desc"},
          {key: "total_due", label: "Total Due", sortable: true, sortDirection: "desc"},
          {key: "total_complementary", label: "Total Complementary", sortable: true, sortDirection: "desc"},
          {key: "status", label: "Status", sortable: true, sortDirection: "desc"},

        ],
        saleExcelFields: {
          "Date Created": "created_at",
          "Total Sales Amount": "total_amount",
          "Total Paid": "total_paid",
          "Total Balance Due": "total_due",
          "Total Complementary / Forgiven Debt": "total_complementary",
          "Status": "status",
          "Customer Name": "customer_details.name",
          "Customer Phone": "customer_details.phone"
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
        selectedStatus: null,
        recordsForMerging: [],
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
          merged_records: null
        },
        success: [],
        errors: [],
        mergeBtnState: "initialize",
        startMerge: false,
        filterBtnState: "initialize",
        fromDate: null,
        toDate: null,
      }
    },
    computed: {
      rows: function () {
        return this.sales.length
      },
      today: function () {
        return DateTime.local().toLocaleString(DateTime.DATE_HUGE)
      },
      totalAmount: function () {
        let sum = 0
        this.sales.forEach((sale) => {
          sum += sale.total_amount
        })
        return sum
      },
      totalPaid: function () {
        let sum = 0
        this.sales.forEach((sale) => {
          sum += sale.total_paid
        })
        return sum
      },
      totalDue: function () {
        let sum = 0
        this.sales.forEach((sale) => {
          sum += sale.total_due
        })
        return sum
      },
      totalComplementary: function () {
        let sum = 0
        this.sales.forEach((sale) => {
          sum += sale.total_complementary
        })
        return sum
      },
      mergeBtnText: function () {
        return `Merge ${this.recordsForMerging.length} Records`
      }
    },
    mounted: function () {
      this.getCreditSalesData()
    },
    methods: {
      getCreditSalesData: async function () {
        try {
          this.loading = true
          let params = {}
          if(this.fromDate !== null){
            params.start_date = this.fromDate
            this.filterBtnState = "loading"
          }

          if(this.toDate !== null){
            params.end_date = this.toDate
            this.filterBtnState = "loading"
          }

          let response = await this.$httpClient.get("api/credit-sales", {
            params: params
          })

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

      filterCreditSales: function(){
        if(this.isFilterByDateValid()){
          this.getCreditSalesData()
        }
      },

      isFilterByDateValid: function(){
        if(this.toDate === null || this.fromDate === null){
          this.errors.push('Please select a FROM and TO date')
          return false
        }

        if(DateTime.fromISO(this.toDate) >= DateTime.local()){
          this.errors.push('You cannot get results for a day after today')
          return false
        }

        if(DateTime.fromISO(this.fromDate) > DateTime.fromISO(this.toDate)){
          this.errors.push('The FROM date must be a day before the TO date')
          return false
        }
        return true
      },

      addRecordsToMerge(salesRecords) {
        if(this.startMerge === false && salesRecords.length > 0){
          this.startMerge = true
          this.recordsForMerging = salesRecords
        }

        if(this.startMerge === true && salesRecords.length > 0){
          this.recordsForMerging.push(...salesRecords)

          // remove duplicates
          this.recordsForMerging = _.uniqWith(this.recordsForMerging, _.isEqual)
        }
      },
      async mergeSelectedSalesRecords() {
        try {
          this.mergeBtnState = "loading"
          let idsForMerge = []
          this.recordsForMerging.forEach((record) => {
            idsForMerge.push(record.id)
          })
          await this.$httpClient.put("api/sales", {ids_for_merge: idsForMerge})
          this.success.push("Merge Operation Successful!")
          this.clearMergeOperation()
          this.getCreditSalesData()
        } catch (error) {
          this.mergeBtnState = "fail-try-again"
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },
      clearMergeOperation() {
        this.mergeBtnState = "initialize"
        this.recordsForMerging = []
        this.startMerge = false
        this.$refs.creditSalesTable.clearSelected()
      },
      showCreditRecordModal(salesRecord) {
        this.selectedSalesRecord = salesRecord
        this.$bvModal.show("credit-sale-record")
      }
    }
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
                    <input type="date" class="form-control" v-model="fromDate"/>
                </div>

                <div class="form-group col-12 col-lg-3">
                    <label class="font-weight-bold">
                        To:
                    </label>
                    <input type="date" class="form-control" v-model="toDate"/>
                </div>

                <div class="col-12 col-lg-3 mt-1">
                    <ManagedStateButton
                      main-title="Filter"
                      :state="filterBtnState"
                      class="px-5 mt-4"
                      @clicked="filterCreditSales"
                    ></ManagedStateButton>
                </div>

            </div>

            <div class="row" v-if="recordsForMerging.length > 0">
                <div class="col-12 text-right">
                    <ManagedStateButton :state="mergeBtnState" :main-title="mergeBtnText" class="btn btn-primary"
                                        @clicked="mergeSelectedSalesRecords">
                    </ManagedStateButton>
                    <button class="btn btn-danger ml-3" @click.stop.prevent="clearMergeOperation">
                        <feather type="x" class="align-middle"></feather>
                        <span class="align-middle">Clear Merge</span>
                    </button>
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
                                        <b-form-select
                                                v-model="perPage"
                                                size="sm"
                                                :options="pageOptions"
                                        ></b-form-select
                                        >&nbsp;entries
                                    </label>
                                </div>
                            </div>
                            <!-- Search -->
                            <div class="col-sm-12 col-md-6">
                                <div
                                        class="dataTables_filter text-md-right"
                                >
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

                            <h3 class="col-12 col-lg-7">Manage Credit Sales</h3>

                            <div class="col-12 col-lg-5 text-right">
                                <JsonExcel class="btn btn-dark mb-1" :data="sales" :fields="saleExcelFields"
                                           worksheet="Rikon Credit Sales" name="rikon-credit-sale-history.xls">
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
                                    selectable
                                    select-mode="multi"
                                    @row-selected="addRecordsToMerge"
                                    ref="creditSalesTable"
                            >

                                <template v-slot:head(total_amount)>
                                    <span>Total Sales</span> <br>
                                    <span class="text-info mt-1">({{ totalAmount | money }})</span>
                                </template>

                                <template v-slot:head(total_paid)>
                                    <span>Total Paid</span> <br>
                                    <span class="text-secondary mt-1">({{ totalPaid | money}})</span>
                                </template>

                                <template v-slot:head(total_due)>
                                    <span>Total Balance Due</span> <br>
                                    <span class="text-danger mt-1">({{ totalDue | money}})</span>
                                </template>
                                <template v-slot:head(total_complementary)>
                                    <span>Total Forgiven Debt</span> <br>
                                    <span class="text-secondary mt-1">({{ totalComplementary | money}})</span>
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
                                    <b-button size="sm" variant='dark' @click="row.toggleDetails" class="mr-2">
                                        {{ row.detailsShowing ? "Hide" : "Show"}} Details
                                    </b-button>
                                </template>

                                <template v-slot:cell(actions)="row">
                                    <b-button size="sm" variant='dark' @click="showCreditRecordModal(row.item)"
                                              class="mr-2">
                                        Show Actions
                                    </b-button>
                                </template>

                                <template v-slot:cell(selected)="{ rowSelected }">
                                    <template v-if="rowSelected">
                                        <span aria-hidden="true">&check;</span>
                                        <span class="sr-only">Selected</span>
                                    </template>
                                    <template v-else>
                                        <span aria-hidden="true">&nbsp;</span>
                                        <span class="sr-only">Not selected</span>
                                    </template>
                                </template>

                                <template v-slot:row-details="row">
                                    <b-row class="mb-2">
                                        <b-col cols="12" class="text-center"><span class="font-weight-bold">Credit Authorized By: </span>
                                        </b-col>
                                    </b-row>
                                    <b-row class="mb-2">
                                        <b-col sm="3" class="text-sm-right"><b>Credit Authorized By:</b></b-col>
                                        <b-col>{{ row.item.credit_authorized_by.name }}</b-col>
                                    </b-row>

                                    <b-row class="mb-2">
                                        <b-col cols="12" class="text-center"><span class="font-weight-bold">Customer Details</span>
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

                                </template>

                            </b-table>
                        </div>
                        <div class="row">
                            <div class="col">
                                <div
                                        class="dataTables_paginate paging_simple_numbers float-right"
                                >
                                    <ul class="pagination pagination-rounded mb-0">
                                        <!-- pagination -->
                                        <b-pagination
                                                v-model="currentPage"
                                                :total-rows="rows"
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

        <b-modal id="credit-sale-record" size="xl" hide-footer header-bg-variant="dark" title="Credit Sale Record">
            <FormBackground>
                <CreditSaleRecord :record="selectedSalesRecord"></CreditSaleRecord>
            </FormBackground>
        </b-modal>
    </Layout>
</template>
