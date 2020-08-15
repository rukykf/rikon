<script>
  import FormBackground from "@components/form-background"
  import SuccessFailureAlert from "../../../../../components/success-failure-alert"
  import ManagedStateButton from "../../../../../components/managed-state-button"
  import ErrorHandler from "../../../../../ErrorHandler"

  export default {
    name: "waitress-serial-no-details",
    components: { ManagedStateButton, SuccessFailureAlert, FormBackground },
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
        waitressName: this.order.delivered_by ? this.order.delivered_by.name : null,
        waitressNameValidation: null,
        docketSerialNo: this.order.docket_serial_no,
        disabled: false,
        submitBtnState: "initialize",
      }
    },

    methods: {
      async validateAndSubmit() {
        if (this.isWaitressFormValid()) {
          try {
            this.submitBtnState = "loading"
            let url = `api/orders/${this.order.id}`
            await this.$httpClient.patch(url, {
              docket_serial_no: this.docketSerialNo,
              delivered_by: { name: this.waitressName },
            })
            this.success.push("Successfully Updated Order details")
            this.waitressNameValidation = null
            this.submitBtnState = "success-try-again"
          } catch (error) {
            this.submitBtnState = "fail-try-again"
            let errors = ErrorHandler(error)
            this.errors.push(...errors)
          }
        }
      },

      isWaitressFormValid() {
        if (this.waitressName == null || this.waitressName.length < 1) {
          this.waitressNameValidation = "Enter a valid name"
          return false
        }

        return true
      },
    },
  }
</script>

<template>
  <FormBackground>
    <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
    <div class="form-group">
      <label for="waitressName">
        <h6>Enter Name of Waiter/Waitress: </h6>
        <small v-if="waitressNameValidation !== null" class="text-danger">* {{ waitressNameValidation }}</small>
      </label>

      <input
        id="waitressName"
        v-model="waitressName"
        type="text"
        name="waitressName"
        :disabled="disabled"
        placeholder=""
        class="form-control "
      />
    </div>

    <div class="form-group">
      <label for="docketSerialNo">
        <h6>Enter Serial No. for the corresponding docket <em>(optional)</em>: </h6>
      </label>

      <input
        id="docketSerialNo"
        v-model="docketSerialNo"
        type="text"
        name="docketSerialNo"
        :disabled="disabled"
        placeholder=""
        class="form-control "
      />
    </div>
    <p>
      <ManagedStateButton
        main-title="Submit"
        :state="submitBtnState"
        @clicked="validateAndSubmit"
        success-try-again-title="Edit"
      ></ManagedStateButton>
    </p>
  </FormBackground>
</template>

<style scoped></style>
