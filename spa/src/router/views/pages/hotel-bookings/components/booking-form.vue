<script>
import ManagedStateButton from "../../../../../components/managed-state-button"

export default {
 name: "booking-form",
 components: { ManagedStateButton },
 props: {
  booking: {
   type: Object,
   default: null,
  },
  state: {
   type: String,
   default: "initialize",
  },
 },
 data() {
  return {
   bookingForm: {
    name: this.booking === null ? "" : this.booking.customer_details.name,
    phone: this.booking === null ? "" : this.booking.customer_details.phone,
    address: this.booking === null ? "" : this.booking.customer_details.address,
    numberOfGuests: this.booking === null ? "" : this.booking.customer_details.numberOfGuests,
    emailAddress: this.booking === null ? "" : this.booking.customer_details.emailAddress,
    nextOfKin: this.booking === null ? "" : this.booking.customer_details.nextOfKin,
    nationality: this.booking === null ? "" : this.booking.customer_details.nationality,
    intendedNumberOfNights: this.booking === null ? 1 : this.booking.customer_details.intendedNumberOfNights,
   },
   guestNameValidation: null,
   guestPhoneValidation: null,
   guestAddressValidation: null,
   guestNumberOfGuestsValidation: null,
   guestEmailAddressValidation: null,
   guestNextOfKinValidation: null,
   guestNationalityValidation: null,
   guestIntendedNumberOfNightsValidation: null,
  }
 },

 watch: {
  booking: function(newVal, oldVal) {
   let newBookingForm = {
    name: this.booking === null ? "" : this.booking.customer_details.name,
    phone: this.booking === null ? "" : this.booking.customer_details.phone,
    address: this.booking === null ? "" : this.booking.customer_details.address,
    numberOfGuests: this.booking === null ? "" : this.booking.customer_details.numberOfGuests,
    emailAddress: this.booking === null ? "" : this.booking.customer_details.emailAddress,
    nextOfKin: this.booking === null ? "" : this.booking.customer_details.nextOfKin,
    nationality: this.booking === null ? "" : this.booking.customer_details.nationality,
    intendedNumberOfNights: this.booking === null ? 1 : this.booking.customer_details.intendedNumberOfNights,
   }

   this.bookingForm = newBookingForm
  },
 },

 methods: {
  submitForm() {
   if (this.isBookingFormValid()) {
    this.$emit("save-booking", this.bookingForm)
   }
  },

  isBookingFormValid() {
   if (this.bookingForm.name.length < 1) {
    this.guestNameValidation = "The name of the guest is required"
    return false
   } else {
    this.guestNameValidation = null
   }

   if (this.bookingForm.phone.length !== 11) {
    this.guestPhoneValidation = "The phone number of the guest is required and should be at least 11 characters long"
    return false
   } else {
    this.guestPhoneValidation = null
   }

   if (this.bookingForm.address.length < 1) {
    this.guestAddressValidation = "You must enter a valid address or 'nil'"
    return false
   } else {
    this.guestPhoneValidation = null
   }

   if (this.bookingForm.numberOfGuests.length < 1) {
    this.guestNumberOfGuestsValidation = "You must enter the number of guests"
    return false
   } else {
    this.guestNumberOfGuestsValidation = null
   }

   if (this.bookingForm.emailAddress.length < 1) {
    this.guestEmailAddressValidation = "You must enter a valid email address or 'nil'"
    return false
   } else {
    this.guestEmailAddressValidation = null
   }

   if (this.bookingForm.nextOfKin.length < 1) {
    this.guestNextOfKinValidation = "You must enter a valid next of kin or 'nil'"
    return false
   } else {
    this.guestNextOfKinValidation = null
   }

   if (this.bookingForm.nationality.length < 1) {
    this.guestNationalityValidation = "You must enter a valid guest nationality or 'nil'"
    return false
   } else {
    this.guestNationalityValidation = null
   }

   if (this.bookingForm.intendedNumberOfNights < 1) {
    this.guestIntendedNumberOfNightsValidation = "Number of nights must be greater than or equal to 1"
    return false
   } else {
    this.bookingForm.intendedNumberOfNightsValidation = null
   }

   return true
  },
 },
}
</script>

<template>
 <div class="row">
  <div class="col-6 col-md-6">
   <div class="row">
    <div class="form-group col-12">
     <label for="guestName">
      <h6>Guest Name: </h6>
      <small v-if="guestNameValidation !== null" class="text-danger">* {{ guestNameValidation }}</small>
     </label>

     <input
      type="text"
      id="guestName"
      name="guestName"
      v-model="bookingForm.name"
      placeholder=""
      required
      class="form-control"
     />
    </div>

    <div class="form-group col-12">
     <label for="guestName">
      <h6>Guest Phone Number: </h6>
      <small v-if="guestPhoneValidation !== null" class="text-danger">* {{ guestPhoneValidation }}</small>
     </label>

     <input
      type="text"
      id="guestPhone"
      name="guestPhone"
      v-model="bookingForm.phone"
      placeholder=""
      required
      class="form-control "
     />
    </div>

    <div class="form-group col-12">
     <label for="guestAddress">
      <h6>Guest Address: </h6>
      <small v-if="guestAddressValidation !== null" class="text-danger">* {{ guestAddressValidation }}</small>
     </label>

     <input
      type="text"
      id="guestAddress"
      name="guestAddress"
      v-model="bookingForm.address"
      placeholder=""
      required
      class="form-control"
     />
    </div>

    <div class="form-group col-12">
     <label for="numberOfGuests">
      <h6>Number of Guests: </h6>
      <small v-if="guestNumberOfGuestsValidation !== null" class="text-danger"
       >* {{ guestNumberOfGuestsValidation }}</small
      >
     </label>

     <input
      type="text"
      id="numberOfGuests"
      name="numberOfGuests"
      v-model="bookingForm.numberOfGuests"
      placeholder=""
      required
      class="form-control"
     />
    </div>
   </div>
  </div>
  <div class="col-6 col-md-6">
   <div class="row">
    <div class="form-group col-12">
     <label for="emailAddress">
      <h6>Email Address: </h6>
      <small v-if="guestEmailAddressValidation !== null" class="text-danger">* {{ guestEmailAddressValidation }}</small>
     </label>

     <input
      type="text"
      id="emailAddress"
      name="emailAddress"
      v-model="bookingForm.emailAddress"
      placeholder=""
      required
      class="form-control"
     />
    </div>

    <div class="form-group col-12">
     <label for="nextOfKin">
      <h6>Next of Kin: </h6>
      <small v-if="guestNextOfKinValidation !== null" class="text-danger">* {{ guestNextOfKinValidation }}</small>
     </label>

     <input
      type="text"
      id="nextOfKin"
      name="numberOfGuests"
      v-model="bookingForm.nextOfKin"
      placeholder=""
      required
      class="form-control"
     />
    </div>

    <div class="form-group col-12">
     <label for="nationality">
      <h6>Nationality: </h6>
      <small v-if="guestNationalityValidation !== null" class="text-danger">* {{ guestNationalityValidation }}</small>
     </label>

     <input
      type="text"
      id="nationality"
      name="nationality"
      v-model="bookingForm.nationality"
      placeholder=""
      required
      class="form-control"
     />
    </div>

    <div class="form-group col-12">
     <label for="numberOfNights">
      <h6>Intended Number of Nights: </h6>
      <small v-if="guestIntendedNumberOfNightsValidation !== null" class="text-danger"
       >* {{ guestIntendedNumberOfNightsValidation }}</small
      >
     </label>

     <input
      type="number"
      id="numberOfNights"
      name="numberOfNights"
      v-model.number="bookingForm.intendedNumberOfNights"
      placeholder=""
      required
      class="form-control"
     />
    </div>
   </div>
  </div>

  <ManagedStateButton :state="state" main-title="Save Booking" main-variant="dark" class="ml-3" @clicked="submitForm">
  </ManagedStateButton>
 </div>
</template>

<style scoped></style>
