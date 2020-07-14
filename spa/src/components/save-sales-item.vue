<script>
import SuccessFailureAlert from "./success-failure-alert"
import ErrorHandler from "../ErrorHandler"
import ManagedStateButton from "./managed-state-button"
import Multiselect from "vue-multiselect"

export default {
 name: "save-sales-item",
 components: { ManagedStateButton, SuccessFailureAlert, Multiselect },
 props: {
  item: {
   type: Object,
   default: function() {
    return {
     id: null,
     name: null,
     unit: null,
     price_per_unit: null,
     department: null,
     department_id: null,
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
   newItemNameValidation: null,
   newItemUnitValidation: null,
   newItemPricePerUnitValidation: null,
   newItemDepartmentValidation: null,
   newItem: {
    name: this.item.name,
    unit: this.item.unit,
    price_per_unit: this.item.price_per_unit,
    department: this.item.department,
    department_id: this.item.department_id,
   },
   departments: [],
   disabled: false,
   errors: [],
   success: [],
  }
 },
 mounted: function() {
  this.getDepartmentsData()
 },

 methods: {
  getDepartmentsData: async function() {
   try {
    let response = await this.$httpClient.get("api/departments")
    this.departments = response.data
   } catch (error) {
    let errors = ErrorHandler(error)
    this.errors.push(...errors)
   }
  },
  validateAndSubmit: async function() {
   if (this.isValid()) {
    try {
     this.newItem.department_id = this.newItem.department.id
     this.submitBtnState = "loading"
     let url = "api/sales-items/"

     if (this.item.id != null) {
      url += this.item.id
     }

     await this.$httpClient.post(url, this.newItem)
     this.success.push(`Successfully saved item with name: ${this.newItem.name}`)
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
   if (this.newItem.name === null || this.newItem.name.length < 1) {
    this.newItemNameValidation = "Item name is required"
    return false
   }

   if (this.newItem.unit === null || this.newItem.unit.length < 1) {
    this.newItemUnitValidation = "Item unit is required"
    return false
   }

   if (this.newItem.price_per_unit <= 0) {
    this.newItemPricePerUnitValidation = "Enter a valid price per unit"
    return false
   }

   if (this.newItem.department == null) {
    this.newItemDepartmentValidation = "You must select a department for this item"
    return false
   }

   return true
  },
  resetForm: function() {
   this.newItem.name = null
   this.newItem.unit = null
   this.newItem.price_per_unit = null
   this.newItem.department = "kitchen"
   this.disabled = false
   this.newItemDepartmentValidation = null
   this.newItemNameValidation = null
   this.newItemUnitValidation = null
   this.newItemPricePerUnitValidation = null
  },
 },
}
</script>

<template>
 <div>
  <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
  <div class="pt-3">
   <div class="form-group">
    <label for="itemName">
     <h6>Enter Item Name: </h6>
     <small v-if="newItemNameValidation !== null" class="text-danger">* {{ newItemNameValidation }}</small>
    </label>

    <input
     type="text"
     id="itemName"
     name="itemName"
     :disabled="disabled"
     v-model="newItem.name"
     placeholder=""
     required
     class="form-control "
    />
   </div>

   <div class="form-group">
    <label for="itemUnit">
     <h6>Enter Unit: </h6>
     <small v-if="newItemUnitValidation !== null" class="text-danger">* {{ newItemUnitValidation }}</small>
    </label>

    <input
     type="text"
     id="itemUnit"
     name="itemUnit"
     :disabled="disabled"
     v-model="newItem.unit"
     placeholder="e.g gallon(s), bottle(s), plate(s), bag(s)"
     class="form-control "
    />
   </div>

   <div class="form-group">
    <label for="itemPricePerUnit">
     <h6>Enter Price per Unit (Naira): </h6>
     <small v-if="newItemPricePerUnitValidation !== null" class="text-danger"
      >* {{ newItemPricePerUnitValidation }}</small
     >
    </label>

    <input
     type="number"
     id="itemPricePerUnit"
     name="itemPricePerUnit"
     :disabled="disabled"
     v-model.number="newItem.price_per_unit"
     placeholder="e.g 3000, 4000"
     class="form-control "
    />
   </div>

   <div class="form-group">
    <label for="itemDepartment">
     <h6>Select the department this item is sold in: </h6>
     <small v-if="newItemDepartmentValidation !== null" class="text-danger">* {{ newItemDepartmentValidation }}</small>
    </label>

    <Multiselect
     :disabled="disabled"
     id="itemDepartment"
     :options="departments"
     track-by="id"
     label="name"
     v-model="newItem.department"
    >
    </Multiselect>
   </div>
  </div>

  <p>
   <ManagedStateButton
    mainTitle="Save Sales Item"
    successTryAgainTitle="Save Another Sales Item"
    :state="submitBtnState"
    @clicked="validateAndSubmit"
   ></ManagedStateButton>
  </p>
 </div>
</template>

<style scoped>
.store-item-form {
 background: #f5f5f5;
}

.rounded {
 border-radius: 1rem;
}

.nav-pills .nav-link {
 color: #555;
}

.nav-pills .nav-link.active {
 color: white;
}

input[type="radio"] {
 margin-right: 5px;
}

.bold {
 font-weight: bold;
}
</style>
