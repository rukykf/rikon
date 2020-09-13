<script>
  import FormBackground from "@components/form-background"
  import ErrorHandler from "@src/ErrorHandler"
  import SuccessFailureAlert from "@components/success-failure-alert"
  import ManagedStateButton from "@components/managed-state-button"
  import Multiselect from "vue-multiselect"

  export default {
    name: "collect-company-payment",
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
        authorizedCompaniesList: [],
        authorizedBy: null,
        selectedCompany: null,
        authorizedByValidation: null,
        selectedCompanyValidation: null,
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
        await this.getCompanyListData()
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

      async getCompanyListData() {
        let url = `api/management-list?list_name=authorized_company`
        let { data: companyList } = await this.$httpClient.get(url)
        this.authorizedCompaniesList = companyList
      },

      async addCompanyDebt() {
        let { data: sale } = await this.$httpClient.post("api/sales", {
          sellable_type: this.sellableType,
          sellable_id: this.sellableId,
          transaction_type: "company",
          transaction_details: {
            credit_authorized_by: { name: this.authorizedBy.full_name },
            customer_details: {
              name: this.selectedCompany.full_name,
              phone: "",
              room: "",
              additionalDetails: "Company Transaction",
            },
          },
        })

        return sale
      },

      async addManagementTransactions(saleId) {
        await this.$httpClient.post(`api/management-list-transactions`, {
          management_list_item_id: this.authorizedBy.id,
          sales_id: saleId,
          transaction_type: "debt",
          department_id: this.department.id === "x" ? 0 : this.department.id,
        })

        await this.$httpClient.post(`api/management-list-transactions`, {
          management_list_item_id: this.selectedCompany.id,
          sales_id: saleId,
          transaction_type: "debt",
          department_id: this.department.id === "x" ? 0 : this.department.id,
        })
      },

      async validateAndPay() {
        if (this.isValid()) {
          try {
            this.paymentBtnState = "loading"
            let sale = await this.addCompanyDebt()
            await this.addManagementTransactions(sale.id)
            this.paymentBtnState = "initialize"
            this.$emit("success", sale)
            this.success.push("Successfully recorded company transaction")
          } catch (error) {
            this.paymentBtnState = "fail-try-again"
            let errors = ErrorHandler(error)
            this.errors.push(...errors)
            this.$emit("error")
          }
        }
      },

      isValid() {
        let isValid = true

        if (this.authorizedBy === null) {
          this.authorizedByValidation = "Select the name of whoever is authorizing this company transaction"
          isValid = false
        }

        if (this.selectedCompany === null) {
          this.selectedCompanyValidation = "Select the name of the company"
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
            <h6>Select the name of <strong>whoever authorized</strong> this company transaction: </h6>
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
          <label for="selectedCompany">
            <h6>Select the <strong>company</strong>:</h6>
            <small v-if="selectedCompanyValidation !== null" class="text-danger"
              >* {{ selectedCompanyValidation }}</small
            >
          </label>

          <Multiselect
            v-model="selectedCompany"
            :options="authorizedCompaniesList"
            id="selectedCompany"
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
          main-title="Record Company Transaction"
          main-variant="primary"
          feather-icon="credit-card"
          @clicked="validateAndPay"
        ></ManagedStateButton>
      </p>
    </div>
  </FormBackground>
</template>

<style scoped></style>
