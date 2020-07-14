<script>
import StateButton from "@components/state-button"
import SuccessFailureAlert from "@components/success-failure-alert"

export default {
 name: "query-store-item",
 components: { SuccessFailureAlert, StateButton },
 props: {
  item: {
   type: Object,
   required: true,
  },
 },
 data: function() {
  return {
   submitBtn: {
    title: "Launch Query",
    variant: "primary",
    loading: false,
    disabled: false,
    icon: "none",
   },
   queryActualQuantityValidation: null,
   disabled: false,
   errors: [],
   success: [],
   query: {
    expectedQuantity: this.item.quantity,
    actualQuantity: null,
   },
  }
 },
 methods: {
  validateAndSubmit: function() {
   if (this.isValid()) {
    this.newDepartmentNameValidation = null
    this.submitBtn.loading = true
    setTimeout(() => {
     this.submitBtn.variant = "success"
     this.submitBtn.loading = false
     this.submitBtn.disabled = true
     this.submitBtn.icon = "check"
     this.submitBtn.title = "Success"
     this.disabled = true
     this.$emit("query-launched", this.query)
     this.success.push(`Successfully Launched Query for ${this.item.name}`)
    }, 1200)
   }
  },
  isValid: function() {
   if (this.query.actualQuantity < 1) {
    this.queryActualQuantityValidation = "Enter a valid number greater than 0"
    return false
   }

   if (this.query.actualQuantity >= this.query.expectedQuantity) {
    this.errors.push(`You can only launch a query for cases where the quantity on ground
                    is less than the expected quantity and ${this.query.actualQuantity} is greater than ${this.query.expectedQuantity}`)
    return false
   }

   return true
  },
 },
}
</script>

<template>
 <div>
  <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
  <div class="pt-3">
   <div class="form-group">
    <h6
     >Expected Quantity: <span class="m-lg-5">{{ query.expectedQuantity }}</span></h6
    >
    <label for="queryActualQuantity">
     <h6 class="text-info">Enter actual quantity in stock: </h6>
     <small v-if="queryActualQuantityValidation !== null" class="text-danger"
      >* {{ queryActualQuantityValidation }}</small
     >
    </label>

    <input
     type="number"
     id="queryActualQuantity"
     name="queryActualQuantity"
     :disabled="disabled"
     v-model.number="query.actualQuantity"
     placeholder=""
     required
     class="form-control "
    />
   </div>
  </div>

  <p>
   <StateButton :buttonState="submitBtn" @clicked="validateAndSubmit"></StateButton>
  </p>
 </div>
</template>
