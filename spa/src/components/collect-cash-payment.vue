<script>
  import SuccessFailureAlert from "./success-failure-alert"
  import ManagedStateButton from "./managed-state-button"
  import ErrorHandler from "@src/ErrorHandler"
  import { formatMoney } from "accounting-js"

  export default {
    name: "collect-cash-payment",
    components: { ManagedStateButton, SuccessFailureAlert },
    props: {
      state: {
        type: String,
        default: "initialize", // possible values are ['loading', 'success', 'fail', 'try-again', 'add-another-payment']
      },
      requiredAmount: {
        type: Number,
        default: 200,
      },

      isStandalone: {
        type: Boolean,
        default: false,
      },

      sellableType: {
        type: String,
        required: true,
      },
      sellableId: {
        type: Number,
        required: true,
      },
      exactAmountRequired: {
        type: Boolean,
        default: false,
      },
    },
    data: function() {
      return {
        amount: this.requiredAmount,
        paymentMethod: null,
        amountValidation: null,
        paymentMethodValidation: null,
        errors: [],
        success: [],
        disabled: false,
        paymentBtnState: this.state,
      }
    },
    computed: {
      computedDisabled: function() {
        if ((this.state === "success" || this.state === "fail") && this.isStandalone === false) {
          return true
        }
        return this.disabled
      },

      computedPaymentBtnState: function() {
        if (this.isStandalone === false && this.paymentBtnState !== "loading") {
          return this.state
        } else {
          return this.paymentBtnState
        }
      },
    },

    watch: {
      requiredAmount: function(newVal, oldVal) {
        this.amount = newVal
      },
    },

    methods: {
      validateAndPay: async function() {
        if (this.validate()) {
          try {
            this.paymentBtnState = "loading"
            let response = await this.$httpClient.post("api/sales", {
              sellable_type: this.sellableType,
              sellable_id: this.sellableId,
              transaction_type: "cash",
              transaction_details: {
                transaction_type: this.paymentMethod.toLowerCase(),
                amount: this.amount,
              },
            })
            this.success.push(
              `Successfully paid ${formatMoney(this.amount, {
                symbol: "N",
                precision: 0,
              })} for this ${this.sellableType}`
            )
            this.paymentBtnState = "success-try-again"
            this.$emit("success", response.data)
          } catch (error) {
            let errors = ErrorHandler(error)
            this.paymentBtnState = "fail-try-again"
            this.$emit("error", errors)
            this.errors.push(...errors)
          }
          this.amountValidation = null
          this.paymentMethodValidation = null
        }
      },
      validate: function() {
        if (this.exactAmountRequired && this.amount !== this.requiredAmount) {
          this.amountValidation = "Customer should pay: " + this.requiredAmount
          return false
        }

        if (this.amount < 1 && this.requiredAmount > 0) {
          this.amountValidation = "Amount should be greater than 1"
          return false
        }

        if (this.paymentMethod === null) {
          this.paymentMethodValidation = "Select a valid payment method"
          return false
        }

        return true
      },
    },
  }
</script>

<template>
  <div class="row text-left mt-3 ">
    <div class="col-12 payment-form pt-4 mt-2 mx-auto">
      <div class="card ">
        <div class="card-body">
          <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
          <div class="pt-3">
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

            <div class="form-group">
              <label for="amount">
                <h6>Enter Amount (Naira): </h6>
                <small v-if="amountValidation !== null" class="text-danger">* {{ amountValidation }}</small>
              </label>

              <input
                type="number"
                id="amount"
                name="amount"
                :disabled="computedDisabled"
                v-model.number="amount"
                placeholder="0.00"
                required
                class="form-control "
              />
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
      </div>
    </div>
  </div>
</template>

<style scoped>
  .payment-form {
    background: #f5f5f5;
  }

  .rounded {
    border-radius: 1rem;
  }

  .nav-pills .nav-link {
    color: #555;
  }

  .nav-pills .nav-link.active {
    color: white;
  }

  input[type="radio"] {
    margin-right: 5px;
  }

  .bold {
    font-weight: bold;
  }
</style>
