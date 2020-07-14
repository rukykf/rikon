<script>
import StateButton from "@components/state-button"
import SuccessFailureAlert from "@components/success-failure-alert"

export default {
 name: "resolve-query",
 components: { SuccessFailureAlert, StateButton },
 props: {
  query: {
   type: Object,
   required: true,
  },
 },
 data: function() {
  return {
   submitBtn: {
    title: "Resolve Query",
    variant: "primary",
    loading: false,
    disabled: false,
    icon: "none",
   },
   newQueryNotesValidation: null,
   disabled: false,
   errors: [],
   success: [],
   newQuery: {
    expectedQuantity: this.query.expectedQuantity,
    actualQuantity: this.query.actualQuantity,
    item: this.query.item,
    notes: null,
    actionTaken: "declare missing",
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
     this.$emit("query-resolved", this.query)
     this.success.push(`Successfully Resolved Query #${this.query.id}`)
    }, 1200)
   }
  },
  isValid: function() {
   if (this.newQuery.notes === null) {
    this.newQueryNotesValidation = "Enter a valid description of events associated with this query"
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
   <table class="table table-borderless">
    <tbody>
     <tr>
      <td><h6>Query Launch Date:</h6></td>
      <td>{{ query.date }}</td>
     </tr>
     <tr>
      <td><h6>Expected Quantity:</h6></td>
      <td>{{ query.expectedQuantity }}</td>
     </tr>
     <tr>
      <td><h6>Actual Quantity:</h6></td>
      <td>{{ query.actualQuantity }}</td>
     </tr>
     <tr>
      <td><h6>Item Name:</h6></td>
      <td>{{ query.item.name }}</td>
     </tr>
    </tbody>
   </table>
   <div class="form-group">
    <label for="queryNotes">
     <h6 class="text-info">Notes: </h6>
     <small v-if="newQueryNotesValidation !== null" class="text-danger">* {{ newQueryNotesValidation }}</small>
    </label>

    <textarea
     id="queryNotes"
     name="queryNotes"
     :disabled="disabled"
     v-model="newQuery.notes"
     placeholder="e.g Items stolen but recovered from..."
     class="form-control "
    ></textarea>
   </div>

   <div class="form-group mt-3">
    <h6 class="pb-2 text-info">Select Action:</h6>
    <label class="radio-inline">
     <input
      type="radio"
      name="optradio"
      :disabled="disabled"
      value="declare missing"
      v-model="newQuery.actionTaken"
      checked
     />
     Declare Missing
    </label>
    <label class="radio-inline">
     <input
      type="radio"
      name="optradio"
      :disabled="disabled"
      value="add items"
      v-model="newQuery.actionTaken"
      class="radio-single ml-5 mr-1"
     />
     Add {{ newQuery.expectedQuantity - newQuery.actualQuantity }} of {{ newQuery.item.name }} to store
    </label>
    <label class="radio-inline">
     <input
      type="radio"
      name="optradio"
      :disabled="disabled"
      value="take no action"
      v-model="newQuery.actionTaken"
      class="ml-5 mr-1"
     />
     Take No Action
    </label>
   </div>
  </div>

  <p>
   <StateButton :buttonState="submitBtn" @clicked="validateAndSubmit"></StateButton>
  </p>
 </div>
</template>
