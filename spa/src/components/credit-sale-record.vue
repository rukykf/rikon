<script>
  import DisplayCustomerOrderDetails from "../router/views/pages/reports/components/display-customer-order-details"
  import DisplayCustomerBookingDetails from "../router/views/pages/reports/components/display-customer-booking-details"
  import ManagedStateButton from "./managed-state-button"
  import ErrorHandler from "@src/ErrorHandler"
  import SuccessFailureAlert from "./success-failure-alert"

  export default {
    name: "credit-sale-record",
    components: {
      SuccessFailureAlert,
      ManagedStateButton,
      DisplayCustomerBookingDetails,
      DisplayCustomerOrderDetails,
    },
    props: {
      record: {
        type: Object,
        required: true,
      },
    },
    data: function() {
      return {
        tabs: ["record details", "sales details", "transaction history"],
        currentTab: "record details",
        newTransaction: {
          amount: 0,
          paymentMethod: null,
        },
        newTransactionValidation: null,
        showNewTransactionForm: false,
        showNewTransactionPaymentMethodOptions: false,
        transactionType: null,
        newTransactionBtnState: "initialize",
        loading: false,
        disabled: false,
        salesTransactions: [],
        success: [],
        errors: [],
      }
    },

    mounted() {
      this.getTransactionHistory()
    },

    methods: {
      async getTransactionHistory() {
        try {
          this.loading = true
          let response = await this.$httpClient.get(`api/sales/${this.record.id}/sales-transactions`)
          this.salesTransactions = response.data
          this.loading = false
        } catch (error) {
          this.loading = false
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      async revertSalesTransaction(salesTransaction, event) {
        try {
          event.target.innerHTML = "Reverting..."
          let response = await this.$httpClient.post(`api/sales-transactions/${salesTransaction.id}`)
          let updatedSalesRecord = response.data
          this.record.total_due = updatedSalesRecord.total_due
          this.record.total_complementary = updatedSalesRecord.total_complementary
          this.record.total_paid = updatedSalesRecord.total_paid
          this.record.status = updatedSalesRecord.status
          this.success.push("Transaction reverted successfully")
          this.getTransactionHistory()
        } catch (error) {
          event.target.innerHTML = "Revert Transaction"
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      validateAndSubmit() {
        if (this.transactionType === "payment") {
          this.addPayment()
        }

        if (this.transactionType === "complementary") {
          this.addComplementary()
        }

        if (this.transactionType === "discount") {
          this.addDiscount()
        }
      },

      async addPayment() {
        if (this.newTransaction.paymentMethod === null) {
          this.newTransactionValidation = "please select a valid payment method"
          return
        }

        if (this.newTransaction.amount > this.record.total_due || this.newTransaction.amount <= 0) {
          this.newTransactionValidation = `please enter a valid amount between 1 and ${this.record.total_due}`
          return
        }

        try {
          this.newTransactionBtnState = "loading"
          let newSalesRecord = await this.$httpClient.post(`api/sales/${this.record.id}`, {
            transaction_details: {
              transaction_type: this.newTransaction.paymentMethod,
              amount: this.newTransaction.amount,
            },
          })
          this.success.push(`Successfully added payment of ${this.newTransaction.amount} to this record`)
          this.record.total_due = newSalesRecord.data.total_due
          this.record.total_paid = newSalesRecord.data.total_paid
          this.record.status = newSalesRecord.data.status
          this.clearTransactionForm()
        } catch (error) {
          this.newTransactionBtnState = "fail-try-again"
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      async addComplementary() {
        if (this.newTransaction.amount > this.record.total_due || this.newTransaction.amount <= 0) {
          this.newTransactionValidation = `please enter a valid amount between 1 and ${this.record.total_due}`
          return
        }

        try {
          this.newTransactionBtnState = "loading"
          let newSalesRecord = await this.$httpClient.post(`api/sales/${this.record.id}`, {
            transaction_details: {
              transaction_type: "complementary",
              amount: this.newTransaction.amount,
            },
          })
          this.success.push(`Successfully added complementary of ${this.newTransaction.amount} to this record`)
          this.record.total_complementary = newSalesRecord.data.total_complementary
          this.record.total_due = newSalesRecord.data.total_due
          this.record.status = newSalesRecord.data.status
          this.clearTransactionForm()
        } catch (error) {
          this.newTransactionBtnState = "fail-try-again"
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      async addDiscount() {
        if (this.newTransaction.amount > this.record.total_due || this.newTransaction.amount <= 0) {
          this.newTransactionValidation = `please enter a valid amount between 1 and ${this.record.total_due}`
          return
        }

        try {
          this.newTransactionBtnState = "loading"
          let newSalesRecord = await this.$httpClient.post(`api/sales/${this.record.id}`, {
            transaction_details: {
              transaction_type: "discount",
              amount: this.newTransaction.amount,
            },
          })
          this.success.push(`Successfully added discount of ${this.newTransaction.amount} to this record`)
          this.record.total_complementary = newSalesRecord.data.total_complementary
          this.record.total_due = newSalesRecord.data.total_due
          this.record.status = newSalesRecord.data.status
          this.clearTransactionForm()
        } catch (error) {
          this.newTransactionBtnState = "fail-try-again"
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      clearTransactionForm() {
        this.newTransaction.amount = 0
        this.newTransaction.paymentMethod = null
        this.disabled = false
        this.newTransactionBtnState = "initialize"
        this.showNewTransactionForm = false
        this.showNewTransactionPaymentMethodOptions = false
        this.getTransactionHistory()
      },

      displayTransactionForm(transactionType) {
        if (this.showNewTransactionForm && transactionType === this.transactionType) {
          this.showNewTransactionForm = false
          this.showNewTransactionPaymentMethodOptions = false
          this.transactionType = null
        } else {
          this.clearTransactionForm()
          this.transactionType = transactionType
          this.showNewTransactionForm = true
          this.newTransactionValidation = null

          this.showNewTransactionPaymentMethodOptions = transactionType === "payment"

          if (transactionType === "complementary") {
            this.newTransaction.amount = this.record.total_due
            this.disabled = true
          }
        }
      },
    },
  }
</script>
<template>
  <div>
    <b-nav tabs justified>
      <b-nav-item v-for="tab in tabs" :key="tab" :active="currentTab === tab" @click="currentTab = tab">
        <h5 :class="currentTab === tab ? 'font-weight-bold' : 'font-weight-normal'">{{ tab | capitalize }}</h5>
      </b-nav-item>
    </b-nav>

    <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>

    <div v-if="currentTab === 'record details'" class="mt-3">
      <div>
        <b-row class="mb-2">
          <b-col sm="3" class="text-sm-right"><b>Sale ID:</b></b-col>
          <b-col>{{ record.unique_id }}</b-col>
        </b-row>

        <b-row class="mb-2">
          <b-col sm="3" class="text-sm-right"><b>Date Created:</b></b-col>
          <b-col>{{ record.created_at | humanDate }} at {{ record.updated_at | humanTime }}</b-col>
        </b-row>

        <b-row class="mb-2">
          <b-col sm="3" class="text-sm-right"><b>Date Modified:</b></b-col>
          <b-col>{{ record.updated_at | humanDate }} at {{ record.updated_at | humanTime }}</b-col>
        </b-row>

        <div v-if="record.customer_details != null">
          <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Customer Name:</b></b-col>
            <b-col>{{ record.customer_details.name | capitalizeAll }}</b-col>
          </b-row>

          <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Customer Phone:</b></b-col>
            <b-col>{{ record.customer_details.phone }}</b-col>
          </b-row>
        </div>

        <div v-if="record.credit_authorized_by != null">
          <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Credit Authorized By: </b></b-col>
            <b-col>{{ record.credit_authorized_by.name | capitalizeAll }}</b-col>
          </b-row>

          <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Additional Details:</b></b-col>
            <b-col>{{ record.customer_details.additionalDetails }}</b-col>
          </b-row>
        </div>

        <b-row class="mb-2">
          <b-col sm="3" class="text-sm-right"><b>Total Amount:</b></b-col>
          <b-col>{{ record.total_amount | money }}</b-col>
        </b-row>

        <b-row class="mb-2">
          <b-col sm="3" class="text-sm-right"><b>Total Paid:</b></b-col>
          <b-col>{{ record.total_paid | money }}</b-col>
        </b-row>

        <b-row class="mb-2">
          <b-col sm="3" class="text-sm-right"><b>Balance Due:</b></b-col>
          <b-col>{{ record.total_due | money }}</b-col>
        </b-row>

        <b-row class="mb-2">
          <b-col sm="3" class="text-sm-right"><b>Total Complementary:</b></b-col>
          <b-col>{{ record.total_complementary | money }}</b-col>
        </b-row>

        <b-row class="mb-2">
          <b-col sm="3" class="text-sm-right"><b>Status:</b></b-col>
          <b-col>{{ record.status | capitalizeAll }}</b-col>
        </b-row>
      </div>

      <div class="row mt-3" v-if="record.status !== 'paid'">
        <div class="col-12 text-left">
          <button class="btn btn-primary mt-1" @click.stop.prevent="displayTransactionForm('payment')"
            >Add Payment
          </button>
          <button class="btn btn-secondary ml-sm-2 mt-1" @click.stop.prevent="displayTransactionForm('complementary')"
            >Mark as Complementary
          </button>
          <button class="btn btn-dark ml-sm-2 mt-1" @click.stop.prevent="displayTransactionForm('discount')"
            >Add Discount
          </button>
        </div>
      </div>

      <div class="mt-5" v-if="showNewTransactionForm">
        <small v-if="newTransactionValidation !== null" class="text-danger">* {{ newTransactionValidation }}</small>
        <div class="form-group" v-if="showNewTransactionPaymentMethodOptions">
          <h6 class="pb-2">Select payment method</h6>
          <label class="radio-inline">
            <input type="radio" name="optradio" value="cash" v-model="newTransaction.paymentMethod" checked />
            Cash
          </label>
          <label class="radio-inline">
            <input type="radio" name="optradio" value="transfer" v-model="newTransaction.paymentMethod" class="ml-5" />
            Transfer
          </label>
          <label class="radio-inline">
            <input type="radio" name="optradio" value="POS" v-model="newTransaction.paymentMethod" class="ml-5" />
            POS
          </label>
        </div>

        <div class="form-group">
          <label for="amount">
            <h6>Enter Amount (Naira): </h6>
          </label>

          <input
            type="number"
            id="amount"
            name="amount"
            v-model.number="newTransaction.amount"
            placeholder="0.00"
            required
            :disabled="disabled"
            class="form-control "
          />
        </div>

        <p>
          <ManagedStateButton
            :state="newTransactionBtnState"
            :main-title="'Submit ' + transactionType"
            main-variant="primary"
            @clicked="validateAndSubmit"
          ></ManagedStateButton>
        </p>
      </div>
    </div>
    <div v-else-if="currentTab === 'sales details'" class="mt-3">
      <slot name="sales-details">
        <DisplayCustomerBookingDetails
          :details="record.booking"
          v-if="record.sellable_type === 'booking'"
        ></DisplayCustomerBookingDetails>
        <DisplayCustomerOrderDetails
          :details="record.order"
          v-if="record.sellable_type === 'order'"
        ></DisplayCustomerOrderDetails>
        <!--        <DisplayMergedSaleDetails-->
        <!--          :details="record.details"-->
        <!--          v-if="record.details.type === 'merged'"-->
        <!--        ></DisplayMergedSaleDetails>-->
      </slot>
    </div>
    <div v-else-if="currentTab === 'transaction history'" class="mt-3">
      <div v-if="loading">
        <div class="text-center my-5">
          <b-spinner variant="primary" label="Spinning" class="p-5"></b-spinner>
        </div>
      </div>
      <div v-else>
        <table class="table table-hover table-responsive">
          <thead>
            <th>Date</th>
            <th>Transaction Type</th>
            <th>Amount</th>
            <th>Recorded By</th>
            <th>Action</th>
          </thead>
          <tbody>
            <tr v-for="(salesTransaction, index) in salesTransactions" :key="index">
              <td>{{ salesTransaction.date | humanDate }}</td>
              <td>{{ salesTransaction.transaction_type }}</td>
              <td>{{ salesTransaction.amount | money }}</td>
              <td>{{ salesTransaction.registered_by | capitalize }}</td>
              <td>
                <a
                  v-if="
                    (salesTransaction.transaction_type === 'cash' ||
                      salesTransaction.transaction_type === 'pos' ||
                      salesTransaction.transaction_type === 'transfer' ||
                      salesTransaction.transaction_type === 'discount') &&
                      salesTransaction.active === 1
                  "
                  class="badge badge-dark"
                  href="#"
                  @click.stop.prevent="revertSalesTransaction(salesTransaction, $event)"
                  >Revert Transaction</a
                >
                <span v-else>IRREVERSIBLE</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
