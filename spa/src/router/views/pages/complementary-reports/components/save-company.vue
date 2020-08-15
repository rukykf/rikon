<script>
  import ErrorHandler from "@src/ErrorHandler"
  import SuccessFailureAlert from "@components/success-failure-alert"
  import ManagedStateButton from "@components/managed-state-button"

  export default {
    name: "save-company",
    components: { ManagedStateButton, SuccessFailureAlert },
    props: {
      company: {
        type: Object,
        default: null,
      },
      addMultiple: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        errors: [],
        success: [],
        companyName: this.company === null ? "" : this.company.full_name,
        companyNameValidation: null,
        submitBtnState: "initialize",
        disabled: false,
      }
    },

    methods: {
      async validateAndSubmit() {
        if (this.isValid()) {
          try {
            this.submitBtnState = "loading"
            let url = "api/management-list"
            if (this.company !== null) {
              url += `/${this.company.id}`
            }
            await this.$httpClient.post(url, {
              full_name: this.companyName,
              list_name: "authorized_company",
            })
            this.success.push(`Successfully added ${this.companyName} to the list of active companies`)

            if (this.addMultiple) {
              this.submitBtnState = "success-try-again"
              this.resetForm()
            } else {
              this.submitBtnState = "success"
              this.disabled = true
            }
          } catch (error) {
            let errors = ErrorHandler(error)
            this.errors.push(...errors)
            this.submitBtnState = "fail-try-again"
          }
        }
      },

      isValid() {
        let isValid = true

        if (this.companyName.length < 1) {
          this.companyNameValidation = "Enter the name of this company"
          isValid = false
        }

        return isValid
      },

      resetForm() {
        this.companyName = ""
        this.companyNameValidation = null
      },
    },
  }
</script>

<template>
  <div>
    <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>

    <div class="pt-3">
      <div class="form-group">
        <label for="companyName">
          <h6>Enter Company Name: </h6>
          <small v-if="companyNameValidation !== null" class="text-danger">* {{ companyNameValidation }}</small>
        </label>

        <input
          id="companyName"
          v-model.trim="companyName"
          type="text"
          name="companyName"
          :disabled="disabled"
          placeholder=""
          class="form-control"
        />
      </div>
    </div>

    <p>
      <ManagedStateButton
        main-title="Save Company"
        success-try-again-title="Save Another Company"
        :state="submitBtnState"
        @clicked="validateAndSubmit"
      ></ManagedStateButton>
    </p>
  </div>
</template>

<style scoped></style>
