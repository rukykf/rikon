<script>
  import StateButton from "@components/state-button"
  import SuccessFailureAlert from "@components/success-failure-alert"

  export default {
    name: "receive-store-item",
    components: { SuccessFailureAlert, StateButton },
    props: {
      item: {
        type: Object,
        required: true,
      },
      entry: {
        type: Object,
        default: function() {
          return {
            quantity: null,
            supplier: null,
          }
        },
      },
    },
    data: function() {
      return {
        submitBtn: {
          title: "Receive Items",
          variant: "primary",
          loading: false,
          disabled: false,
          icon: "none",
        },
        newEntryQuantityValidation: null,
        newEntry: {
          quantity: this.entry.quantity,
          supplier: this.entry.supplier,
        },
        disabled: false,
        errors: [],
        success: [],
      }
    },
    computed: {
      newEntryQuantity: function() {
        if (this.newEntry.quantity === null) {
          return "XXXX"
        }
        return this.newEntry.quantity
      },
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
            this.$emit("store-item-received", this.newEntry)
            this.success.push(`Successfully received ${this.newEntry.quantity} ${this.item.unit} of ${this.item.name}`)
          }, 1200)
        }
      },
      isValid: function() {
        if (this.newEntry.quantity < 1) {
          this.newEntryQuantityValidation = "Enter a valid quantity that is greater than 0"
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
      <h4
        >Receive <span class="text-info">({{ newEntryQuantity }})</span> {{ item.unit }} of
        <span class="text-info">{{ item.name }}</span></h4
      >
      <div class="form-group">
        <label for="entryQuantity">
          <h6>Enter Quantity: </h6>
          <small v-if="newEntryQuantityValidation !== null" class="text-danger"
            >* {{ newEntryQuantityValidation }}</small
          >
        </label>

        <input
          type="number"
          id="entryQuantity"
          name="entryQuantity"
          :disabled="disabled"
          v-model.number="newEntry.quantity"
          placeholder=""
          required
          class="form-control "
        />
      </div>

      <div class="form-group">
        <label for="entrySupplier">
          <h6>Enter Supplier Information <em>(if available):</em></h6>
        </label>

        <input
          type="text"
          id="entrySupplier"
          name="entrySupplier"
          :disabled="disabled"
          v-model="newEntry.supplier"
          placeholder=""
          class="form-control "
        />
      </div>
    </div>

    <p>
      <StateButton :buttonState="submitBtn" @clicked="validateAndSubmit"></StateButton>
    </p>
  </div>
</template>
