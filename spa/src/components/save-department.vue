<script>
import SuccessFailureAlert from "./success-failure-alert"
import ManagedStateButton from "./managed-state-button"
import ErrorHandler from "../ErrorHandler"

export default {
 name: "SaveDepartment",
 components: { ManagedStateButton, SuccessFailureAlert },
 props: {
  department: {
   type: Object,
   default: function() {
    return {
     id: null,
     name: null,
    }
   },
  },
  addMultiple: {
   type: Boolean,
   default: false,
  },
 },
 data: function() {
  return {
   submitBtnState: "initialize",
   newDepartmentNameValidation: null,
   newDepartment: {
    id: this.department.id,
    name: this.department.name,
   },
   disabled: false,
   errors: [],
   success: [],
  }
 },
 methods: {
  validateAndSubmit: async function() {
   if (this.isValid()) {
    try {
     this.submitBtnState = "loading"
     let url = "api/departments/"

     if (this.department.id != null) {
      url += this.department.id
     }

     await this.$httpClient.post(url, this.newDepartment)
     this.success.push(`Successfully saved department: ${this.newDepartment.name}`)
     if (this.addMultiple) {
      this.submitBtnState = "success-try-again"
      this.resetForm()
     } else {
      this.disabled = true
      this.submitBtnState = "success"
     }
    } catch (error) {
     this.submitBtnState = "fail-try-again"
     let errors = ErrorHandler(error)
     this.errors.push(...errors)
    }
   }
  },
  isValid: function() {
   if (this.newDepartment.name === null || this.newDepartment.name.length < 1) {
    this.newDepartmentNameValidation = "Department name is required"
    return false
   }

   return true
  },
  resetForm: function() {
   this.newDepartment.name = null
   this.newDepartmentNameValidation = null
  },
 },
}
</script>

<template>
 <div>
  <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
  <div class="pt-3">
   <div class="form-group">
    <label for="departmentName">
     <h6>Enter Department Name: </h6>
     <small v-if="newDepartmentNameValidation !== null" class="text-danger">* {{ newDepartmentNameValidation }}</small>
    </label>

    <input
     id="departmentName"
     v-model="newDepartment.name"
     type="text"
     name="departmentName"
     :disabled="disabled"
     placeholder=""
     class="form-control "
    />
   </div>
  </div>

  <p>
   <ManagedStateButton
    main-title="Save Department"
    success-try-again-title="Save Another Department"
    :state="submitBtnState"
    @clicked="validateAndSubmit"
   ></ManagedStateButton>
  </p>
 </div>
</template>
