<script>
  import CollectCashPayment from "@components/collect-payment/collect-exact-cash-payment"
  import CollectDiscountPayment from "@components/collect-payment/collect-exact-discount-payment"
  import CollectComplementaryPayment from "@components/collect-payment/collect-complementary-payment"
  import CollectCredit from "@components/collect-payment/collect-credit"
  import FormBackground from "@components/form-background"
  import CollectCompanyPayment from "@components/collect-payment/collect-company-payment"

  export default {
    name: "collect-order-payment",
    components: {
      CollectCompanyPayment,
      FormBackground,
      CollectComplementaryPayment,
      CollectDiscountPayment,
      CollectCashPayment,
      CollectCredit,
    },
    props: {
      requiredAmount: {
        type: Number,
        default: 200,
      },
      orderId: {
        type: Number,
        required: true,
      },
    },
    data() {
      return {
        paymentSelectionPane: true,
        selectedPane: null,
        disabled: false,
        state: "initialize",
        department: this.$store.state.auth.currentDepartment,
      }
    },

    computed: {
      computedDisabled() {
        if (this.state === "success" || this.state === "fail") {
          return true
        }
        return false
      },
    },

    methods: {
      switchToCollectCashPane() {
        this.selectedPane = "cash"
        this.paymentSelectionPane = false
      },

      switchToCollectDiscountPane() {
        this.selectedPane = "discount"
        this.paymentSelectionPane = false
      },

      switchToCollectComplementaryPane() {
        this.selectedPane = "complementary"
        this.paymentSelectionPane = false
      },

      switchToCollectCompanyPane() {
        this.selectedPane = "company"
        this.paymentSelectionPane = false
      },

      switchToCollectCreditPane() {
        this.selectedPane = "credit"
        this.paymentSelectionPane = false
      },

      handleError() {
        this.$emit("error")
        this.state = "fail-try-again"
      },

      handleSuccess() {
        this.disabled = true
        this.state = "success"
        this.$emit("success")
      },
    },
  }
</script>

<template>
  <div>
    <keep-alive>
      <div v-if="department.id === 'x'">
        <FormBackground class="text-center">
          YOU CANNOT COLLECT PAYMENTS FOR <STRONG>ALL DEPARTMENTS</STRONG>. YOU NEED TO SELECT A SPECIFIC DEPARTMENT TO
          COLLECT PAYMENTS INTO. TO RESOLVE THIS ISSUE FOLLOW THESE STEPS: <BR /> <STRONG>1.)</STRONG>PLEASE LOG OUT
          <BR /><STRONG>2.)</STRONG>SELECT A VALID DEPARTMENT (e.g kitchen, bar etc.). <BR /><STRONG>3.)</STRONG>LOGIN
          AND TRY AGAIN.
        </FormBackground>
      </div>

      <div v-else-if="paymentSelectionPane">
        <div class="row">
          <div class="offset-3 col-5 text-center font-weight-bold"><h5>Collect Payment</h5></div>
          <button
            @click.stop.prevent="switchToCollectCashPane"
            :disabled="computedDisabled"
            class="offset-3 col-5 btn btn-primary mt-3"
            >Cash / POS / Transfer</button
          >

          <button
            @click.stop.prevent="switchToCollectDiscountPane"
            :disabled="computedDisabled"
            class="offset-3 col-5 btn btn-dark mt-3"
            >Discount</button
          >

          <button
            @click.stop.prevent="switchToCollectComplementaryPane"
            :disabled="computedDisabled"
            class="offset-3 col-5 btn btn-dark mt-3"
            >Complementary</button
          >

          <button
            @click.stop.prevent="switchToCollectCompanyPane"
            :disabled="computedDisabled"
            class="offset-3 col-5 btn btn-dark mt-3"
            >Company</button
          >

          <button
            @click.stop.prevent="switchToCollectCreditPane"
            :disabled="computedDisabled"
            class="offset-3 col-5 btn btn-danger mt-3"
            >Debt</button
          >
        </div>
      </div>

      <div v-else>
        <div class="row mt-3">
          <button @click.stop.prevent="paymentSelectionPane = true" class="btn btn-dark col-3">Go Back</button>
        </div>

        <CollectCashPayment
          v-if="selectedPane === 'cash'"
          :required-amount="requiredAmount"
          :state="state"
          sellable-type="order"
          :sellable-id="orderId"
          @success="handleSuccess"
          @error="handleError"
        ></CollectCashPayment>

        <CollectDiscountPayment
          v-else-if="selectedPane === 'discount'"
          :required-amount="requiredAmount"
          :state="state"
          sellable-type="order"
          :sellable-id="orderId"
          @success="handleSuccess"
          @error="handleError"
        ></CollectDiscountPayment>

        <CollectComplementaryPayment
          v-else-if="selectedPane === 'complementary'"
          :required-amount="requiredAmount"
          :state="state"
          :sellable-id="orderId"
          sellable-type="order"
          @success="handleSuccess"
          @error="handleError"
        ></CollectComplementaryPayment>

        <CollectCredit
          v-else-if="selectedPane === 'credit'"
          :sellable-id="orderId"
          sellable-type="order"
          :state="state"
          @success="handleSuccess"
          @error="handleError"
        ></CollectCredit>

        <CollectCompanyPayment
          v-else-if="selectedPane === 'company'"
          :state="state"
          :required-amount="requiredAmount"
          :sellable-id="orderId"
          sellable-type="order"
          @success="handleSuccess"
          @error="handleError"
        ></CollectCompanyPayment>
      </div>
    </keep-alive>
  </div>
</template>

<style scoped></style>
