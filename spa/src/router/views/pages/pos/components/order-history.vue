<script>
  import { DateTime } from "luxon"
  import _ from "lodash"
  import SuccessFailureAlert from "@components/success-failure-alert"
  import ErrorHandler from "@src/ErrorHandler"
  import DateTimeSelector from "@components/date-time-selector"
  import ManagedStateButton from "@components/managed-state-button"
  import DisplayOrderItems from "@components/display-order-items"
  import DisplayCustomerOrderDetails from "@views/pages/reports/components/display-customer-order-details"

  export default {
    name: "order-history",
    components: {
      DisplayCustomerOrderDetails,
      DisplayOrderItems,
      ManagedStateButton,
      DateTimeSelector,
      SuccessFailureAlert,
    },
    data() {
      return {
        orders: [],
        orderFields: [
          { key: "unique_id", label: "Computer Gen. ID", sortable: true, stickyColumn: true },
          { key: "docket_serial_no", label: "Docket Serial No.", sortable: true },
          { key: "created_at", label: "Date", sortable: true },
          { key: "destination", label: "Destination", sortable: true },
          { key: "showDetails", label: "More Details", sortable: false },
          { key: "order_items", label: "Order Items", sortable: false },
          { key: "amount", label: "Amount (Naira)", sortable: true },
          { key: "sale", label: "Total Debt", sortable: false },
        ],
        errors: [],
        success: [],
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
        department: this.$store.state.auth.currentDepartment,
        loading: false,
        filterBtnState: "initialize",
        totalRows: 1,
        currentPage: 1,
        perPage: 25,
        pageOptions: [10, 25, 50, 100],
        filter: null,
        filterOn: [],
        filteredOrders: [],
        sortBy: null,
        sortDesc: false,
      }
    },
    mounted() {
      this.getOrdersData()
    },

    computed: {
      numRows: function() {
        return this.orders.length
      },

      totalAmount: function() {
        let sum = 0
        this.filteredOrders.forEach((order) => {
          sum += order.amount
        })
        return sum
      },

      totalDebt: function() {
        let sum = 0
        this.filteredOrders.forEach((order) => {
          sum += order.sale.total_due
        })
        return sum
      },
    },

    methods: {
      async getOrdersData() {
        try {
          this.loading = true
          this.filterBtnState = "loading"
          this.fromDate = this.latestFromDate
          this.toDate = this.latestToDate
          let url = `api/orders?status=fulfilled&start_date=${this.fromDate}&end_date=${this.toDate}`

          if (this.department.id !== "x") {
            url += `&department=${this.department.name}`
          }

          let response = await this.$httpClient.get(url)
          this.orders = response.data.orders
          this.filteredOrders = _.cloneDeep(this.orders)
          this.loading = false
          this.filterBtnState = "initialize"
        } catch (error) {
          this.loading = false
          this.filterBtnState = "initialize"
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
      <div class="col-12 col-lg-5">
        <ManagedStateButton
          main-title="Filter"
          :state="filterBtnState"
          class="px-5 mt-4"
          @clicked="getOrdersData"
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
                Showing <strong>Fulfilled</strong> Orders for
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
              :items="orders"
              :fields="orderFields"
              responsive="sm"
              :per-page="perPage"
              :current-page="currentPage"
              :sort-by.sync="sortBy"
              :sort-desc.sync="sortDesc"
              @filtered="
                (filteredItems) => {
                  this.filteredOrders = filteredItems
                }
              "
              sticky-header="800px"
              :filter="filter"
              :filter-included-fields="filterOn"
            >
              <template v-slot:cell(order_items)="row">
                <display-order-items :order-items="row.item.order_items"></display-order-items>
              </template>

              <template v-slot:cell(unique_id)="row">
                <strong>{{ row.item.unique_id }}</strong>
              </template>

              <template v-slot:head(amount)="row">
                Total Amount <br />
                <span class="text-secondary">({{ totalAmount | money }})</span>
              </template>

              <template v-slot:head(sale)="row">
                Total Debt <br />
                <span class="text-danger">({{ totalDebt | money }})</span>
              </template>

              <template v-slot:cell(created_at)="row">
                {{ row.item.created_at | humanDateWithTime }}
              </template>

              <!--              <template v-slot:cell(actions)="row">-->
              <!--                <a-->
              <!--                  class="badge badge-primary text-white mx-1"-->
              <!--                  href="#"-->
              <!--                  @click.stop.prevent="showEditRoomModal(row.item)"-->
              <!--                  >Edit Room</a-->
              <!--                >-->
              <!--                <a class="badge badge-danger text-white mx-1" href="#" @click.stop.prevent="deleteRoom(row.item)"-->
              <!--                  >Delete Room</a-->
              <!--                >-->
              <!--              </template>-->

              <template v-slot:cell(amount)="row">
                {{ row.item.amount | money }}
              </template>

              <template v-slot:cell(sale)="row">
                {{ row.item.sale.total_due | money }}
              </template>

              <template v-slot:cell(showDetails)="row">
                <b-button size="sm" variant="dark" @click="row.toggleDetails" class="mr-2">
                  {{ row.detailsShowing ? "Hide" : "Show" }} More Details
                </b-button>
              </template>

              <template v-slot:row-details="row">
                <display-customer-order-details :details="row.item"></display-customer-order-details>
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
