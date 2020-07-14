<script>
  import StateButton from "./state-button"
  import SuccessFailureAlert from "./success-failure-alert"

  export default {
    name: "save-store-item",
    components: { SuccessFailureAlert, StateButton },
    props: {
      item: {
        type: Object,
        default: function() {
          return {
            name: null,
            unit: null,
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
        submitBtn: {
          title: "Save Item",
          variant: "primary",
          loading: false,
          disabled: false,
          icon: "none",
        },
        newItemValidation: null,
        newItemNameValidation: null,
        newItemUnitValidation: null,
        newItem: {
          name: this.item.name,
          unit: this.item.unit,
        },
        disabled: false,
        errors: [],
        success: [],
      }
    },
    methods: {
      validateAndSubmit: function() {
        if (this.isValid()) {
          this.newItemNameValidation = null
          this.newItemUnitValidation = null
          this.submitBtn.loading = true
          setTimeout(() => {
            this.submitBtn.variant = "success"
            this.submitBtn.loading = false
            this.submitBtn.disabled = true
            this.submitBtn.icon = "check"
            this.submitBtn.title = "Success"
            this.disabled = true
            this.$emit("store-item-saved", this.newItem)
            this.success.push("Successfully saved")
            if (this.addMultiple) {
              this.resetForm()
            }
          }, 1200)
        }
      },
      isValid: function() {
        if (this.newItem.name === null || this.newItem.name.length <= 0) {
          this.newItemNameValidation = "Item name is required"
          return false
        }

        if (this.newItem.unit === null || this.newItem.unit.length <= 0) {
          this.newItemUnitValidation = "Item unit is required"
          return false
        }

        return true
      },
      resetForm: function() {
        this.submitBtn.variant = "primary"
        this.submitBtn.loading = true
        setTimeout(() => {
          this.newItem.name = null
          this.newItem.unit = null
          this.submitBtn.disabled = false
          this.submitBtn.icon = "none"
          this.submitBtn.title = "Save Another Item"
          this.submitBtn.loading = false
          this.disabled = false
        }, 500)
      },
    },
  }
</script>

<template>
  <div>
    <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
    <div class="pt-3">
      <small v-if="newItemValidation !== null" class="text-danger">* {{ newItemValidation }}</small>
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
    </div>

    <p>
      <StateButton :buttonState="submitBtn" @clicked="validateAndSubmit"></StateButton>
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
