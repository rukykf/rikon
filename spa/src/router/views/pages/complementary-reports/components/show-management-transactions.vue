<script>
  import { DateTime } from "luxon"
  import _ from "lodash"
  import SuccessFailureAlert from "@components/success-failure-alert"
  import ErrorHandler from "@src/ErrorHandler"
  import DateTimeSelector from "@components/date-time-selector"
  import ManagedStateButton from "@components/managed-state-button"
  import Multiselect from "vue-multiselect"
  import FormBackground from "@components/form-background"
  import CreditSaleRecord from "@components/credit-sale-record"
  import DisplayOrderItems from "@components/shared/display-order-items"
  import DisplayBookingDetails from "@components/shared/display-booking-details"

  export default {
    name: "show-management-transactions",
    components: {
      DisplayBookingDetails,
      DisplayOrderItems,
      CreditSaleRecord,
      FormBackground,
      ManagedStateButton,
      DateTimeSelector,
      SuccessFailureAlert,
      Multiselect,
    },
    props: {
      listName: {
        type: String,
        default: "",
      },

      managementListItemId: {
        type: Number,
        default: 0,
      },

      complementaryTotalDisplayTitle: {
        type: String,
        default: "Total Complementary",
      },

      nameDisplayTitle: {
        type: String,
        default: "Name",
      },

      transactionsDisplayTitle: {
        type: String,
        default: "Transactions",
      },
    },

    data() {
      return {
        transactions: [],
        departments: [],
        transactionFields: [
          { key: "unique_id", label: "Unique Sales ID", sortable: true, stickyColumn: true },
          { key: "name", label: "Name", sortable: true },
          { key: "details", label: "Details", sortable: true },
          { key: "showActions", label: "More Details", sortable: false },
          { key: "total_amount", label: "Total Amount", sortable: true },
          { key: "total_paid", label: "Total Paid", sortable: true },
          { key: "total_complementary", label: "Total Complementary", sortable: true },
          { key: "total_due", label: "Balance Due", sortable: true },
        ],
        fromDate: DateTime.local()
          .set({ hour: 8 })
          .toISO(),
        toDate: DateTime.local()
          .plus({ days: 1 })
          .set({ hour: 8 })
          .toISO(),
        latestFromDate: DateTime.local()
          .set({ hour: 8, minute: 0 })
          .toISO(),
        latestToDate: DateTime.local()
          .plus({ days: 1 })
          .set({ hour: 8, minute: 0 })
          .toISO(),
        selectedDepartment: null,
        success: [],
        errors: [],
        loading: false,
        filterBtnState: "initialize",
        totalRows: 1,
        currentPage: 1,
        perPage: 25,
        pageOptions: [10, 25, 50, 100],
        filter: null,
        filterOn: [],
        filteredTransactions: [],
        sortBy: null,
        sortDesc: false,
        selectedTransaction: {},
      }
    },

    async mounted() {
      try {
        this.loading = true
        await this.getTransactionsData()
        await this.getDepartmentData()
        this.loading = false
      } catch (error) {
        this.loading = false
        let errors = ErrorHandler(error)
        this.errors.push(...errors)
      }
    },

    computed: {
      numRows: function() {
        return this.transactions.length
      },

      totalAmount: function() {
        let sum = 0
        this.filteredTransactions.forEach((transaction) => {
          sum += transaction.sale.total_amount
        })
        return sum
      },

      totalComplementary: function() {
        let sum = 0
        this.filteredTransactions.forEach((transaction) => {
          sum += transaction.sale.total_complementary
        })
        return sum
      },

      totalPaid: function() {
        let sum = 0
        this.filteredTransactions.forEach((transaction) => {
          sum += transaction.sale.total_paid
        })
        return sum
      },

      totalDue: function() {
        let sum = 0
        this.filteredTransactions.forEach((transaction) => {
          sum += transaction.sale.total_due
        })
        return sum
      },
    },

    methods: {
      async filterAndGetTransactionsData() {
        try {
          this.loading = true
          this.filterBtnState = "loading"
          await this.getTransactionsData()
          this.loading = false
          this.filterBtnState = "initialize"
        } catch (error) {
          this.loading = false
          this.filterBtnState = "fail-try-again"
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      async getTransactionsData() {
        this.fromDate = this.latestFromDate
        this.toDate = this.latestToDate

        let url = `api/management-list-transactions?start_date=${this.fromDate}&end_date=${this.toDate}`

        if (this.listName.length > 0) {
          url += `&management_list_name=${this.listName}`
        }

        if (this.managementListItemId !== 0) {
          url += `&management_list_item_id=${this.managementListItemId}`
        }

        if (this.selectedDepartment !== null && this.selectedDepartment.id !== null) {
          url += `&department_id=${this.selectedDepartment.id}`
        }

        let response = await this.$httpClient.get(url)
        this.transactions = response.data
        this.filteredTransactions = _.cloneDeep(this.transactions)
      },

      async getDepartmentData() {
        let { data: departments } = await this.$httpClient.get("api/departments")
        this.departments = [{ id: null, name: "All Departments" }, ...departments]
      },

      showCreditSaleRecordModal(selectedTransaction) {
        this.selectedTransaction = selectedTransaction.sale
        this.$bvModal.show("sales-record")
      },
    },
  }
</script>

<template>
  <div class="mt-2">
    <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>

    <div class="row">
      <div class="col-12 col-lg-6">
        <DateTimeSelector :from-date-time.sync="latestFromDate" :to-date-time.sync="latestToDate"></DateTimeSelector>
      </div>
      <div class="col-12 col-lg-3">
        <label for="department">Select Department:</label>
        <Multiselect
          id="department"
          :options="departments"
          label="name"
          track-by="id"
          v-model="selectedDepartment"
          select-label="Click to Select"
        ></Multiselect>
      </div>

      <div class="col-12 col-lg-3">
        <ManagedStateButton
          main-title="Filter / Reload"
          :state="filterBtnState"
          class="px-5 mt-4"
          @clicked="filterAndGetTransactionsData"
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
                Showing <strong>{{ transactionsDisplayTitle | capitalize }}</strong> from
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

          <div class="table-responsive table-hover mb-0">
            <b-table
              :items="transactions"
              :fields="transactionFields"
              responsive="sm"
              :per-page="perPage"
              :current-page="currentPage"
              :sort-by.sync="sortBy"
              :sort-desc.sync="sortDesc"
              @filtered="
                (filteredItems) => {
                  this.filteredTransactions = filteredItems
                }
              "
              sticky-header="800px"
              :filter="filter"
              :filter-included-fields="filterOn"
            >
              <template v-slot:cell(unique_id)="row">
                <strong>{{ row.item.sale.unique_id }}</strong>
              </template>

              <template v-slot:head(name)="row">
                {{ nameDisplayTitle }}
              </template>

              <template v-slot:cell(name)="row">
                <strong>{{ row.item.management_list_item.full_name | capitalizeAll }}</strong>
              </template>

              <template v-slot:cell(details)="row">
                <DisplayOrderItems
                  v-if="row.item.sale.sellable_type === 'order'"
                  :order-items="row.item.sale.order.order_items"
                ></DisplayOrderItems>

                <DisplayBookingDetails
                  v-if="row.item.sale.sellable_type === 'booking'"
                  :booking="row.item.sale.booking"
                ></DisplayBookingDetails>
              </template>

              <template v-slot:cell(showActions)="row">
                <button class="btn btn-dark" @click.stop.prevent="showCreditSaleRecordModal(row.item)"
                  >Show Actions</button
                >
              </template>

              <template v-slot:head(total_amount)="row">
                Total Amount<br />
                <strong>({{ totalAmount | money }})</strong>
              </template>

              <template v-slot:head(total_paid)="row">
                Total Paid<br />
                <strong>({{ totalPaid | money }})</strong>
              </template>

              <template v-slot:head(total_complementary)="row">
                {{ complementaryTotalDisplayTitle }}<br />
                <strong>({{ totalComplementary | money }})</strong>
              </template>

              <template v-slot:head(total_due)="row">
                Balance Due<br />
                <strong class="text-danger">({{ totalDue | money }})</strong>
              </template>

              <template v-slot:cell(total_amount)="row">
                {{ row.item.sale.total_amount | money }}
              </template>

              <template v-slot:cell(total_paid)="row">
                {{ row.item.sale.total_paid | money }}
              </template>

              <template v-slot:cell(total_complementary)="row">
                {{ row.item.sale.total_complementary | money }}
              </template>

              <template v-slot:cell(total_due)="row">
                {{ row.item.sale.total_due | money }}
              </template>
            </b-table>
          </div>

          <div class="row">
            <div class="col">
              <div class="dataTables_paginate paging_simple_numbers float-right">
                <ul class="pagination pagination-rounded mb-0">
                  <!-- pagination -->
                  <b-pagination
                    prev-text="previous"
                    next-text="next"
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

    <b-modal id="sales-record" size="xl" hide-footer header-bg-variant="dark" title="Sales Record">
      <FormBackground>
        <CreditSaleRecord v-if="selectedTransaction !== null" :record="selectedTransaction"></CreditSaleRecord>
      </FormBackground>
    </b-modal>
  </div>
</template>

<style scoped></style>
