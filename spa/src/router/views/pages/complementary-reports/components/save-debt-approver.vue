<script>
  import ErrorHandler from "@src/ErrorHandler"
  import SuccessFailureAlert from "@components/success-failure-alert"
  import ManagedStateButton from "@components/managed-state-button"

  export default {
    name: "save-debt-approver",
    components: { ManagedStateButton, SuccessFailureAlert },
    props: {
      debtApprover: {
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
        debtApproverName: this.debtApprover === null ? "" : this.debtApprover.full_name,
        debtApproverNameValidation: null,
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
            if (this.debtApprover !== null) {
              url += `/${this.debtApprover.id}`
            }
            await this.$httpClient.post(url, {
              full_name: this.debtApproverName,
              list_name: "authorized_to_authorize",
            })
            this.success.push(`Successfully saved ${this.debtApproverName} to the list of debt authorizers`)

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

        if (this.debtApproverName.length < 1) {
          this.debtApproverNameValidation = "Enter the full name of this person"
          isValid = false
        }

        return isValid
      },

      resetForm() {
        this.debtApproverName = ""
        this.debtApproverNameValidation = null
      },
    },
  }
</script>

<template>
  <div>
    <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>

    <div class="pt-3">
      <div class="form-group">
        <label for="debtApproverName">
          <h6>Enter Full Name: </h6>
          <small v-if="debtApproverNameValidation !== null" class="text-danger"
            >* {{ debtApproverNameValidation }}</small
          >
        </label>

        <input
          id="debtApproverName"
          v-model.trim="debtApproverName"
          type="text"
          name="debtApproverName"
          :disabled="disabled"
          placeholder=""
          class="form-control"
        />
      </div>
    </div>

    <p>
      <ManagedStateButton
        main-title="Save Debt Authorizer"
        success-try-again-title="Save Another Debt Authorizer"
        :state="submitBtnState"
        @clicked="validateAndSubmit"
      ></ManagedStateButton>
    </p>
  </div>
</template>

<style scoped></style>
