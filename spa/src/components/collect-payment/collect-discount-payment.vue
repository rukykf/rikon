<script>
  import FormBackground from "@components/form-background"
  import ErrorHandler from "@src/ErrorHandler"
  import SuccessFailureAlert from "@components/success-failure-alert"
  import ManagedStateButton from "@components/managed-state-button"
  import Multiselect from "vue-multiselect"

  export default {
    name: "collect-discount-payment",
    components: { ManagedStateButton, SuccessFailureAlert, FormBackground, Multiselect },
    props: {
      state: {
        type: String,
        default: "initialize", // possible values are ['loading', 'success', 'fail', 'try-again', 'add-another-payment']
      },
      requiredAmount: {
        type: Number,
        required: true,
      },
      sellableType: {
        type: String,
        required: true,
      },
      sellableId: {
        type: Number,
        required: true,
      },
    },
    data() {
      return {
        loading: false,
        success: [],
        errors: [],
        debtAuthorizers: [],
        authorizedForDiscountList: [],
        authorizedBy: null,
        totalAmountDue: this.requiredAmount,
        discountGrantedTo: null,
        discountAmount: 0,
        paymentAmount: 0,
        paymentMethod: null,
        amountValidation: null,
        paymentMethodValidation: null,
        authorizedByValidation: null,
        discountGrantedToValidation: null,
        paymentBtnState: "initialize",
        department: this.$store.state.auth.currentDepartment,
      }
    },

    async mounted() {
      try {
        this.loading = true
        await this.getDebtAuthorizersData()
        await this.getDiscountListData()
        this.loading = false
      } catch (error) {
        this.loading = false
        let errors = ErrorHandler(error)
        this.errors.push(...errors)
      }
    },

    computed: {
      computedDisabled: function() {
        return this.state === "success" || this.state === "fail"
      },

      computedPaymentBtnState: function() {
        if (this.paymentBtnState !== "loading") {
          return this.state
        } else {
          return this.paymentBtnState
        }
      },
    },

    methods: {
      async getDebtAuthorizersData() {
        let url = `api/management-list?list_name=authorized_to_authorize`
        let { data: debtAuthorizers } = await this.$httpClient.get(url)
        this.debtAuthorizers = debtAuthorizers
      },

      async getDiscountListData() {
        let url = `api/management-list?list_name=authorized_for_discounts`
        let { data: discountList } = await this.$httpClient.get(url)
        this.authorizedForDiscountList = discountList
      },

      async addCashPayment() {
        let { data: sale } = await this.$httpClient.post("api/sales", {
          sellable_type: this.sellableType,
          sellable_id: this.sellableId,
          transaction_type: "discount",
          transaction_details: {
            transaction_type: this.paymentMethod.toLowerCase(),
            amount: this.paymentAmount,
            credit_authorized_by: { name: this.authorizedBy.full_name },
            customer_details: {
              name: this.discountGrantedTo.full_name,
              phone: "",
              room: "",
              additionalDetails: "Discount Transaction",
            },
          },
        })

        return sale
      },

      async addDiscountTransaction(saleId) {
        let { data: updatedSale } = await this.$httpClient.post(`api/sales/${saleId}`, {
          transaction_details: {
            transaction_type: "discount",
            amount: this.discountAmount,
          },
        })
        return updatedSale
      },

      async addManagementTransactions(saleId) {
        await this.$httpClient.post(`api/management-list-transactions`, {
          management_list_item_id: this.authorizedBy.id,
          sales_id: saleId,
          transaction_type: "discount",
          department_id: this.department.id === "x" ? 0 : this.department.id,
        })

        await this.$httpClient.post(`api/management-list-transactions`, {
          management_list_item_id: this.discountGrantedTo.id,
          sales_id: saleId,
          transaction_type: "discount",
          department_id: this.department.id === "x" ? 0 : this.department.id,
        })
      },

      async validateAndPay() {
        if (this.isValid()) {
          try {
            this.paymentBtnState = "loading"
            let sale = await this.addCashPayment()
            sale = await this.addDiscountTransaction(sale.id)
            await this.addManagementTransactions(sale.id)
            this.paymentBtnState = "initialize"
            this.success.push(`Successfully paid ${this.paymentAmount}`)
            this.$emit("success", sale)
          } catch (error) {
            this.$emit("error", error)
            this.paymentBtnState = "fail-try-again"
            let errors = ErrorHandler(error)
            this.errors.push(...errors)
          }
        }
      },

      isValid() {
        let isValid = true

        if (this.authorizedBy == null) {
          this.authorizedByValidation = "select the name of whoever approved this discount"
          isValid = false
        }

        if (this.discountGrantedTo == null) {
          this.discountGrantedToValidation = "select the name of whoever is receiving this discount"
          isValid = false
        }

        if (this.paymentMethod === null) {
          this.paymentMethodValidation = "Select a valid method of payment"
          isValid = false
        }

        let totalAmountPaid = this.discountAmount + this.paymentAmount
        if (totalAmountPaid !== this.totalAmountDue) {
          this.amountValidation = `The discount + the amount paid should be equal to ${this.totalAmountDue}`
          isValid = false
        }

        return isValid
      },
    },
  }
</script>

<template>
  <FormBackground>
    <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
    <div v-if="loading" class="text-center">
      <b-spinner class="p-5 m-5"></b-spinner>
    </div>

    <div v-else>
      <div class="pt-3">
        <div class="form-group">
          <label for="authorizedBy">
            <h6>Select the name of <strong>whoever authorized</strong> this discount: </h6>
            <small v-if="authorizedByValidation !== null" class="text-danger">* {{ authorizedByValidation }}</small>
          </label>

          <Multiselect
            v-model="authorizedBy"
            :options="debtAuthorizers"
            id="authorizedBy"
            :disabled="computedDisabled"
            label="full_name"
            track-by="id"
          ></Multiselect>
        </div>

        <div class="form-group">
          <label for="discountGrantedTo">
            <h6>Select the name of <strong>whoever is receiving</strong> this discount: </h6>
            <small v-if="discountGrantedToValidation !== null" class="text-danger"
              >* {{ discountGrantedToValidation }}</small
            >
          </label>

          <Multiselect
            v-model="discountGrantedTo"
            :options="authorizedForDiscountList"
            id="discountGrantedTo"
            :disabled="computedDisabled"
            label="full_name"
            track-by="id"
          ></Multiselect>
        </div>

        <div class="form-group">
          <label for="totalAmountDue">
            <h6>Total Amount Due: </h6>
          </label>

          <input
            type="number"
            id="totalAmountDue"
            name="amount"
            :disabled="computedDisabled"
            v-model.number="totalAmountDue"
            required
            class="form-control "
          />
        </div>

        <div class="form-group">
          <label for="discountAmount">
            <h6>Enter Discount Amount: </h6>
          </label>

          <input
            type="number"
            id="discountAmount"
            name="amount"
            :disabled="computedDisabled"
            v-model.number="discountAmount"
            placeholder="0.00"
            required
            class="form-control "
          />
        </div>

        <div class="form-group">
          <label for="amount">
            <h6>Enter Amount Paid (Naira): </h6>
            <small v-if="amountValidation !== null" class="text-danger">* {{ amountValidation }}</small>
          </label>

          <input
            type="number"
            id="amount"
            name="amount"
            :disabled="computedDisabled"
            v-model.number="paymentAmount"
            placeholder="0.00"
            required
            class="form-control "
          />
        </div>

        <div class="form-group ">
          <small v-if="paymentMethodValidation !== null" class="text-danger">* {{ paymentMethodValidation }}</small>
          <h6 class="pb-2">Select payment method:</h6>
          <label class="radio-inline">
            <input
              type="radio"
              name="optradio"
              :disabled="computedDisabled"
              value="cash"
              v-model="paymentMethod"
              checked
            />
            Cash
          </label>
          <label class="radio-inline">
            <input
              type="radio"
              name="optradio"
              :disabled="computedDisabled"
              value="transfer"
              v-model="paymentMethod"
              class="ml-5"
            />Transfer
          </label>
          <label class="radio-inline">
            <input
              type="radio"
              name="optradio"
              :disabled="computedDisabled"
              value="POS"
              v-model="paymentMethod"
              class="ml-5"
            />POS
          </label>
        </div>
      </div>

      <p>
        <ManagedStateButton
          :state="computedPaymentBtnState"
          main-title="Add Payment"
          main-variant="primary"
          feather-icon="credit-card"
          @clicked="validateAndPay"
        ></ManagedStateButton>
      </p>
    </div>
  </FormBackground>
</template>

<style scoped></style>
