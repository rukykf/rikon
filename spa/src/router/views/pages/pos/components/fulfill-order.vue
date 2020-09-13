<script>
  import FormBackground from "@components/form-background"
  import SuccessFailureAlert from "../../../../../components/success-failure-alert"
  import ErrorHandler from "../../../../../ErrorHandler"
  import CollectOrderPayment from "@components/collect-payment/collect-order-payment"

  export default {
    name: "fulfill-order",
    components: { CollectOrderPayment, FormBackground, SuccessFailureAlert },
    props: {
      order: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        errors: [],
        success: [],
        loading: false,
        collectPaymentFormState: "initialize",
      }
    },

    computed: {
      requiredAmount() {
        if (this.order.sale != null) {
          return this.order.sale.total_due
        } else {
          return this.order.amount
        }
      },
    },

    methods: {
      async validateAndFulfill() {
        try {
          let url = `api/orders/${this.order.id}`
          await this.$httpClient.patch(url, {
            status: "fulfilled",
          })
          this.success.push("Successfully Fulfilled Order")
          this.disabled = true
          this.collectPaymentFormState = "success"
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },
    },
  }
</script>

<template>
  <FormBackground>
    <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
    <div class="text-center" v-if="loading">
      <b-spinner size="lg" class="p-5"></b-spinner>
    </div>
    <CollectOrderPayment
      v-else
      :required-amount="requiredAmount"
      :order-id="order.id"
      @success="validateAndFulfill"
    ></CollectOrderPayment>
  </FormBackground>
</template>

<style scoped></style>
