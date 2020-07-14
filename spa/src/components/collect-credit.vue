<script>
import ManagedStateButton from "./managed-state-button"
import SuccessFailureAlert from "./success-failure-alert"
import ErrorHandler from "@src/ErrorHandler"

export default {
 name: "collect-credit",
 components: { SuccessFailureAlert, ManagedStateButton },
 props: {
  state: {
   type: String,
   default: "initialize", // possible values are ['loading', 'success', 'fail', 'try-again']
  },

  isStandalone: {
   type: Boolean,
   default: false,
  },

  roomNumberRequired: {
   type: Boolean,
   default: false,
  },

  phoneNumberRequired: {
   type: Boolean,
   default: false,
  },

  sellableType: {
   type: String,
   required: true,
  },

  sellableId: {
   type: Number,
   required: true,
  },

  customerName: {
   type: String,
   default: "",
  },

  customerRoom: {
   type: Number,
   default: 0,
  },

  customerPhone: {
   type: String,
   default: "",
  },
 },
 data: function() {
  return {
   name: this.customerName,
   errors: [],
   success: [],
   phoneNumber: this.customerPhone,
   roomNumber: this.customerRoom,
   authorizedBy: "",
   nameValidation: null,
   disabled: false,
   submitBtnState: "initialize",
   roomNumberValidation: null,
   phoneNumberValidation: null,
   authorizedByValidation: null,
  }
 },

 computed: {
  computedDisabled: function() {
   if ((this.state === "success" || this.state === "fail") && this.isStandalone === false) {
    return true
   }
   return this.disabled
  },

  computedSubmitBtnState: function() {
   if (this.isStandalone === false && this.submitBtnState !== "loading") {
    return this.state
   } else {
    return this.submitBtnState
   }
  },
 },

 watch: {},

 methods: {
  validateAndSubmit: async function() {
   if (this.validate()) {
    try {
     this.submitBtnState = "loading"
     let response = await this.$httpClient.post("api/sales", {
      sellable_type: this.sellableType,
      sellable_id: this.sellableId,
      transaction_type: "credit",
      transaction_details: {
       credit_authorized_by: { name: this.authorizedBy },
       customer_details: {
        name: this.name,
        phone: this.phoneNumber,
        room: this.roomNumber,
       },
      },
     })
     this.success.push(`Successfully recorded debt for ${this.name}`)
     this.submitBtnState = "success-try-again"
     this.$emit("success", response.data)
    } catch (error) {
     let errors = ErrorHandler(error)
     this.submitBtnState = "fail-try-again"
     this.$emit("error", errors)
     this.errors.push(...errors)
    }
    this.nameValidation = null
    this.roomNumberValidation = null
    this.phoneNumberValidation = null
    this.authorizedByValidation = null
   }
  },
  validate: function() {
   if (this.authorizedBy.length < 1) {
    this.authorizedByValidation = "Enter the name of whoever is authorizing this debt"
    return false
   }

   // name is always required
   if (this.name.length < 1) {
    this.nameValidation = "The customer's name is required"
    return false
   }

   if (this.roomNumberRequired && (this.roomNumber < 100 || this.roomNumber > 400)) {
    this.roomNumberValidation = "Enter a valid room number between 100 and 320"
    return false
   }

   if (this.phoneNumberRequired && this.phoneNumber.length !== 11) {
    this.phoneNumberValidation = "Enter a valid 11 digit phone number"
    return false
   }
   return true
  },
 },
}
</script>

<template>
 <div class="row text-left mt-3 ">
  <div class="col-12 payment-form pt-4 mt-2 mx-auto">
   <div class="card ">
    <div class="card-body">
     <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>

     <div class="pt-3">
      <div class="form-group">
       <label for="authorizedBy">
        <h6>Enter the name of whoever authorized this debt: </h6>
        <small v-if="authorizedByValidation !== null" class="text-danger">* {{ authorizedByValidation }}</small>
       </label>

       <input
        type="text"
        id="authorizedBy"
        name="text"
        :disabled="computedDisabled"
        v-model="authorizedBy"
        placeholder=""
        class="form-control "
       />
      </div>

      <div class="form-group">
       <label for="name">
        <h6>Enter Customer Name: </h6>
        <small v-if="nameValidation !== null" class="text-danger">* {{ nameValidation }}</small>
       </label>

       <input
        type="text"
        id="name"
        name="text"
        :disabled="computedDisabled"
        v-model="name"
        placeholder=""
        class="form-control "
       />
      </div>

      <div class="form-group">
       <label for="roomNumber">
        <h6>Enter Room Number <span class="font-italic">(optional)</span>: </h6>
        <small v-if="roomNumberValidation !== null" class="text-danger">* {{ roomNumberValidation }}</small>
       </label>

       <input
        type="number"
        id="roomNumber"
        name="number"
        :disabled="computedDisabled"
        v-model.number="roomNumber"
        placeholder="e.g 103"
        class="form-control "
       />
      </div>

      <div class="form-group">
       <label for="phoneNumber">
        <h6>Enter Customer Phone Number <span class="font-italic">(optional)</span>: </h6>
        <small v-if="phoneNumberValidation !== null" class="text-danger">* {{ phoneNumberValidation }}</small>
       </label>

       <input
        type="text"
        id="phoneNumber"
        name="text"
        :disabled="computedDisabled"
        v-model="phoneNumber"
        placeholder="e.g 08123456789"
        class="form-control "
       />
      </div>
     </div>

     <p>
      <ManagedStateButton
       :state="computedSubmitBtnState"
       main-title="Submit"
       main-variant="primary"
       @clicked="validateAndSubmit"
      ></ManagedStateButton>
     </p>
    </div>
   </div>
  </div>
 </div>
</template>

<style scoped>
.payment-form {
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
