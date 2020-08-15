<script>
  import ErrorHandler from "@src/ErrorHandler"
  import SuccessFailureAlert from "@components/success-failure-alert"
  import ManagedStateButton from "@components/managed-state-button"

  export default {
    name: "save-complementary-receiver",
    components: { ManagedStateButton, SuccessFailureAlert },
    props: {
      complementaryReceiver: {
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
        complementaryReceiverName: this.complementaryReceiver === null ? "" : this.complementaryReceiver.full_name,
        complementaryReceiverNameValidation: null,
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
            if (this.complementaryReceiver !== null) {
              url += `/${this.complementaryReceiver.id}`
            }
            await this.$httpClient.post(url, {
              full_name: this.complementaryReceiverName,
              list_name: "authorized_for_complementary",
            })
            this.success.push(
              `Successfully added ${this.complementaryReceiverName} to the list of people approved for complementary service`
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

        if (this.complementaryReceiverName.length < 1) {
          this.complementaryReceiverNameValidation = "Enter the full name of this person"
          isValid = false
        }

        return isValid
      },

      resetForm() {
        this.complementaryReceiverName = ""
        this.complementaryReceiverNameValidation = null
      },
    },
  }
</script>

<template>
  <div>
    <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>

    <div class="pt-3">
      <div class="form-group">
        <label for="complementaryReceiverName">
          <h6>Enter Full Name: </h6>
          <small v-if="complementaryReceiverNameValidation !== null" class="text-danger"
            >* {{ complementaryReceiverNameValidation }}</small
          >
        </label>

        <input
          id="complementaryReceiverName"
          v-model.trim="complementaryReceiverName"
          type="text"
          name="complementaryReceiverName"
          :disabled="disabled"
          placeholder=""
          class="form-control"
        />
      </div>
    </div>

    <p>
      <ManagedStateButton
        main-title="Save Complementary Service Recipient"
        success-try-again-title="Save Another Complementary Service Recipient"
        :state="submitBtnState"
        @clicked="validateAndSubmit"
      ></ManagedStateButton>
    </p>
  </div>
</template>

<style scoped></style>
