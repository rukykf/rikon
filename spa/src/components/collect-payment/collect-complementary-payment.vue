<script>
  import FormBackground from "@components/form-background"
  import ErrorHandler from "@src/ErrorHandler"
  import SuccessFailureAlert from "@components/success-failure-alert"
  import ManagedStateButton from "@components/managed-state-button"
  import Multiselect from "vue-multiselect"

  export default {
    name: "collect-complementary-payment",
    components: {
      FormBackground,
      ManagedStateButton,
      SuccessFailureAlert,
      Multiselect,
    },

    props: {
      state: {
        type: String,
        default: "initialize", // possible values are ['loading', 'success', 'fail', 'try-again', 'add-another-payment']
      },
      requiredAmount: {
        type: Number,
        default: 200,
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
        authorizedForComplementaryList: [],
        authorizedBy: null,
        complementaryGrantedTo: null,
        authorizedByValidation: null,
        complementaryGrantedToValidation: null,
        paymentBtnState: "initialize",
        department: this.$store.state.auth.currentDepartment,
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

    async mounted() {
      try {
        this.loading = true
        await this.getDebtAuthorizersData()
        await this.getComplementaryListData()
        this.loading = false
      } catch (error) {
        this.loading = false
        let errors = ErrorHandler(error)
        this.errors.push(...errors)
      }
    },

    methods: {
      async getDebtAuthorizersData() {
        let url = `api/management-list?list_name=authorized_to_authorize`
        let { data: debtAuthorizers } = await this.$httpClient.get(url)
        this.debtAuthorizers = debtAuthorizers
      },

      async getComplementaryListData() {
        let url = `api/management-list?list_name=authorized_for_complementary`
        let { data: complementaryList } = await this.$httpClient.get(url)
        this.authorizedForComplementaryList = complementaryList
      },

      async addComplementary() {
        let { data: sale } = await this.$httpClient.post("api/sales", {
          sellable_type: this.sellableType,
          sellable_id: this.sellableId,
          transaction_type: "credit",
          transaction_details: {
            credit_authorized_by: { name: this.authorizedBy.full_name },
            customer_details: {
              name: this.complementaryGrantedTo.full_name,
              phone: "",
              room: "",
              additionalDetails: "Complementary Transaction",
            },
          },
        })

        let { data: updatedSale } = await this.$httpClient.post(`api/sales/${sale.id}`, {
          transaction_details: {
            transaction_type: "complementary",
            amount: this.requiredAmount,
          },
        })

        return updatedSale
      },

      async addManagementTransactions(saleId) {
        await this.$httpClient.post(`api/management-list-transactions`, {
          management_list_item_id: this.authorizedBy.id,
          sales_id: saleId,
          transaction_type: "complementary",
          department_id: this.department.id === "x" ? 0 : this.department.id,
        })

        await this.$httpClient.post(`api/management-list-transactions`, {
          management_list_item_id: this.complementaryGrantedTo.id,
          sales_id: saleId,
          transaction_type: "complementary",
          department_id: this.department.id === "x" ? 0 : this.department.id,
        })
      },

      async validateAndPay() {
        if (this.isValid()) {
          try {
            this.paymentBtnState = "loading"
            let sale = await this.addComplementary()
            await this.addManagementTransactions(sale.id)
            this.paymentBtnState = "success-try-again"
            this.success.push("Successfully recorded complementary service")
            this.$emit("success", sale)
          } catch (error) {
            this.paymentBtnState = "fail-try-again"
            let errors = ErrorHandler(error)
            this.errors.push(...errors)
            this.$emit("error", errors)
          }
        }
      },

      isValid() {
        let isValid = true

        if (this.authorizedBy === null) {
          this.authorizedByValidation = "Select the name of whoever is authorizing this complementary transaction"
          isValid = false
        }

        if (this.complementaryGrantedTo === null) {
          this.complementaryGrantedToValidation = "Select the name of whoever is receiving this complementary service"
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
            <h6>Select the name of <strong>whoever authorized</strong> this complementary service: </h6>
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
          <label for="complementaryGrantedTo">
            <h6>Select the name of <strong>whoever is receiving</strong> this complementary service: </h6>
            <small v-if="complementaryGrantedToValidation !== null" class="text-danger"
              >* {{ complementaryGrantedToValidation }}</small
            >
          </label>

          <Multiselect
            v-model="complementaryGrantedTo"
            :options="authorizedForComplementaryList"
            id="complementaryGrantedTo"
            :disabled="computedDisabled"
            label="full_name"
            track-by="id"
          ></Multiselect>
        </div>

        <div class="form-group">
          <label for="totalAmountDue">
            <h6>Total Amount: </h6>
          </label>

          <p class="bg-light pl-2 py-2 rounded" id="totalAmountDue">{{ requiredAmount | money }}</p>
        </div>
      </div>

      <p>
        <ManagedStateButton
          :state="computedPaymentBtnState"
          main-title="Record Complementary"
          main-variant="primary"
          feather-icon="credit-card"
          @clicked="validateAndPay"
        ></ManagedStateButton>
      </p>
    </div>
  </FormBackground>
</template>

<style scoped></style>
