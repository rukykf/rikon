<script>
import FormBackground from "@components/form-background"
import SuccessFailureAlert from "../../../../../components/success-failure-alert"
import ManagedStateButton from "../../../../../components/managed-state-button"
import ErrorHandler from "../../../../../ErrorHandler"

export default {
 name: "waitress-details",
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
      status: this.order.status,
      cancellation_remarks: this.order.cancellation_remarks,
      delivered_by: { name: this.waitressName },
     })
     this.success.push("Successfully Updated Waiter/Waitress details")
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
