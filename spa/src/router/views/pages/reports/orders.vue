<script>
  import appConfig from "@src/app.config"
  import Layout from "@layouts/main"
  import { DateTime } from "luxon"
  import SuccessFailureAlert from "../../../../components/success-failure-alert"
  import JsonExcel from "vue-json-excel"
  import ManagedStateButton from "../../../../components/managed-state-button"
  import DisplayCustomerOrderDetails from "./components/display-customer-order-details"
  import ErrorHandler from "@src/ErrorHandler"
  import _ from "lodash"
  import Multiselect from "vue-multiselect"
  import DateTimeSelector from "../../../../components/date-time-selector"

  export default {
    page: {
      title: "Orders",
      meta: [{ name: "description", content: appConfig.description }],
    },
    components: {
      DateTimeSelector,
      DisplayCustomerOrderDetails,
      ManagedStateButton,
      SuccessFailureAlert,
      Layout,
      JsonExcel,
      Multiselect,
    },
    data() {
      return {
        orders: [],
        filteredOrders: [],
        departments: [],
        selectedDepartment: null,
        orderFields: [
          { key: "SN", label: "S/N", sortable: false, sortDirection: "desc" },
          { key: "created_at", label: "Order Placed On", sortable: true, sortDirection: "desc" },
          { key: "sale", label: "Total Sales", sortable: true, sortDirection: "desc" },
          { key: "amount", label: "Total Amount", sortable: true, sortDirection: "desc" },
          { key: "departments", label: "Departments", sortable: true, sortDirection: "desc" },
          { key: "status", label: "Order Status", sortable: true, sortDirection: "desc" },
          { key: "cancellation_remarks", label: "Cancellation Notes", sortable: true, sortDirection: "desc" },
          { key: "destination", label: "Destination", sortable: true, sortDirection: "desc" },
          { key: "showDetails", label: "Show Order Details", sortable: true, sortDirection: "desc" },
        ],
        orderExcelFields: {
          "Order Placed On": "created_at",
          "Total Amount": "amount",
          Departments: "departments",
          Status: "status",
          "Cancellation Remarks": "cancellation_remarks",
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
        filterBtnState: "initialize",
        fromDate: DateTime.local()
          .minus({ days: 90 })
          .toISODate(),
        toDate: DateTime.local().toISODate(),
        selectedStatus: null,
        success: [],
        errors: [],
      }
    },
    computed: {
      rows: function() {
        return this.orders.length
      },

      today: function() {
        return DateTime.local().toLocaleString(DateTime.DATE_HUGE)
      },

      totalPaid: function() {
        let sum = 0
        this.filteredOrders.forEach((order) => {
          if (_.has(order, ["sale", "total_paid"])) {
            sum += order.sale.total_paid
          }
        })
        return sum
      },

      totalAmount: function() {
        let sum = 0
        this.filteredOrders.forEach((order) => {
          sum += order.amount
        })
        return sum
      },
    },

    mounted: function() {
      this.getOrdersData()
      this.getDepartmentsData()
    },

    methods: {
      filterOrders: function() {
        if (this.isFilterByDateValid()) {
          this.getOrdersData()
        }
      },

      updateFilteredOrdersWithFilteredList: function(filteredList, filteredListLength) {
        this.filteredOrders = filteredList
      },

      isFilterByDateValid: function() {
        if (this.toDate === null || this.fromDate === null) {
          this.errors.push("Please select a FROM and TO date")
          return false
        }

        if (DateTime.fromISO(this.fromDate) > DateTime.fromISO(this.toDate)) {
          this.errors.push("The FROM date must be a day before or the same as the TO date")
          return false
        }
        return true
      },

      getOrdersData: async function() {
        try {
          this.loading = true
          this.filterBtnState = "loading"
          let url = `api/orders?start_date=${this.fromDate}&end_date=${this.toDate}`

          if (this.selectedStatus !== null && this.selectedStatus !== "") {
            url += `&status=${this.selectedStatus}`
          }

          if (this.selectedDepartment !== null && this.selectedDepartment.id !== "xxx") {
            url += `&department=${this.selectedDepartment.name}`
          }

          let response = await this.$httpClient.get(url)
          this.orders = response.data.orders
          this.filteredOrders = _.cloneDeep(this.orders)
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
          this.departments = [{ id: "xxx", name: "all" }]
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
  <Layout>
    <div class="mt-4">
      <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
      <div class="row mt-4"> </div>
      <div class="row mt-4">
        <div class="form-group col-12 col-lg-4">
          <DateTimeSelector></DateTimeSelector>
        </div>
        <div class="form-group col-12 col-lg-3">
          <label class="font-weight-bold">
            Department:
          </label>
          <Multiselect id="department" :options="departments" track-by="id" label="name" v-model="selectedDepartment">
          </Multiselect>
        </div>
        <div class="form-group col-12 col-lg-2">
          <label class="font-weight-bold">
            Status:
          </label>
          <select class="form-control" v-model="selectedStatus">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div class="col-12 col-lg-3 mt-1">
          <ManagedStateButton
            main-title="Filter"
            :state="filterBtnState"
            class="px-5 mt-4"
            @clicked="filterOrders"
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
                >Order History from <span class="text-info">{{ fromDate | humanDate }}</span> to
                <span class="text-info">{{ toDate | humanDate }}</span></h3
              >

              <div class="col-12 col-lg-5 text-right">
                <JsonExcel
                  class="btn btn-dark mb-1"
                  :data="orders"
                  :fields="orderExcelFields"
                  worksheet="Rikon Orders"
                  name="rikon-order-history.xls"
                >
                  <i class="uil uil-chart-line mr-3"></i> Export to Excel
                </JsonExcel>
              </div>
            </div>
            <div v-show="true" class="table-responsive  table-hover mb-0">
              <b-table
                :items="orders"
                :fields="orderFields"
                responsive="sm"
                :per-page="perPage"
                :current-page="currentPage"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :filter="filter"
                :filter-included-fields="filterOn"
                @filtered="updateFilteredOrdersWithFilteredList"
              >
                <template v-slot:cell(SN)="row">
                  {{ row.index + 1 }}
                </template>

                <template v-slot:cell(created_at)="row">
                  {{ row.item.created_at | humanDate }}
                  <span class="font-italic">{{ row.item.created_at | humanTime }}</span>
                </template>

                <template v-slot:head(sale)>
                  Total Paid Amount<br />
                  <span class="text-info">({{ totalPaid | money }})</span>
                </template>

                <template v-slot:head(amount)>
                  Total Amount <br />
                  <span class="text-secondary">({{ totalAmount | money }})</span>
                </template>

                <template v-slot:cell(sale)="row">
                  <span v-if="row.item.sale != null">{{ row.item.sale.total_paid | money }}</span>
                  <span v-else>nil</span>
                </template>

                <template v-slot:cell(amount)="row">
                  {{ row.item.amount | money }}
                </template>

                <template v-slot:cell(showDetails)="row">
                  <b-button size="sm" variant="dark" @click="row.toggleDetails" class="mr-2">
                    {{ row.detailsShowing ? "Hide" : "Show" }} Order Details
                  </b-button>
                </template>

                <template v-slot:row-details="row">
                  <p class="my-3">
                    <DisplayCustomerOrderDetails :details="row.item"></DisplayCustomerOrderDetails>
                  </p>
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
