<script>
  import ErrorHandler from "@src/ErrorHandler"
  import SuccessFailureAlert from "@components/success-failure-alert"
  import ManagedStateButton from "@components/managed-state-button"

  export default {
    name: "save-discount-receiver",
    components: { ManagedStateButton, SuccessFailureAlert },
    props: {
      discountReceiver: {
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
        discountReceiverName: this.discountReceiver === null ? "" : this.discountReceiver.full_name,
        discountReceiverNameValidation: null,
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
            if (this.discountReceiver !== null) {
              url += `/${this.discountReceiver.id}`
            }
            await this.$httpClient.post(url, {
              full_name: this.discountReceiverName,
              list_name: "authorized_for_discounts",
            })
            this.success.push(
              `Successfully added ${this.discountReceiverName} to the list of people approved for discount service`
            )

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

        if (this.discountReceiverName.length < 1) {
          this.discountReceiverNameValidation = "Enter the full name of this person"
          isValid = false
        }

        return isValid
      },

      resetForm() {
        this.discountReceiverName = ""
        this.discountReceiverNameValidation = null
      },
    },
  }
</script>

<template>
  <div>
    <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>

    <div class="pt-3">
      <div class="form-group">
        <label for="discountReceiverName">
          <h6>Enter Full Name: </h6>
          <small v-if="discountReceiverNameValidation !== null" class="text-danger"
            >* {{ discountReceiverNameValidation }}</small
          >
        </label>

        <input
          id="discountReceiverName"
          v-model.trim="discountReceiverName"
          type="text"
          name="discountReceiverName"
          :disabled="disabled"
          placeholder=""
          class="form-control"
        />
      </div>
    </div>

    <p>
      <ManagedStateButton
        main-title="Save Discount Service Recipient"
        success-try-again-title="Save Another Discount Service Recipient"
        :state="submitBtnState"
        @clicked="validateAndSubmit"
      ></ManagedStateButton>
    </p>
  </div>
</template>

<style scoped></style>
