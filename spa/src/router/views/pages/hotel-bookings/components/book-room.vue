<script>
  import CollectCashPayment from "@src/components/collect-cash-payment"
  import SuccessFailureAlert from "../../../../../components/success-failure-alert"
  import _ from "lodash"
  import BookingForm from "./booking-form"
  import ErrorHandler from "../../../../../ErrorHandler"

  export default {
    name: "book-room",
    components: { BookingForm, SuccessFailureAlert, CollectCashPayment },
    props: {
      room: {
        type: Object,
        required: true,
      },
    },
    data: function() {
      return {
        bookRoomFormState: "initialize",
        editCustomerDetailsFormState: "initialize",
        booking: null,
        collectCashPaymentState: "initialize",
        success: [],
        errors: [],
      }
    },

    async mounted() {
      try {
        this.bookRoomFormState = "loading"
        let url = `api/hotel-rooms/${this.room.room.id}/booking`
        let response = await this.$httpClient.get(url)
        if (response.data.customer_details != null) {
          this.booking = response.data
        }
        this.bookRoomFormState = "initialize"
      } catch (error) {
        this.bookRoomFormState = "initialize"
        let errors = ErrorHandler(error)
        this.errors.push(...errors)
      }
    },

    computed: {
      amountDue() {
        if (this.booking != null && this.booking.customer_details != null) {
          return this.booking.price_per_night * this.booking.customer_details.intendedNumberOfNights
        }
        return 0
      },
    },

    methods: {
      bookRoom: async function(bookingForm) {
        try {
          this.bookRoomFormState = "loading"
          let url = `api/hotel-rooms/${this.room.room.id}/bookings`
          let response = await this.$httpClient.post(url, {
            customer_details: bookingForm,
          })
          this.booking = response.data
          this.bookRoomFormState = "success"
          this.success.push("Successfully Booked Room ".concat(this.room.room.room_no))
          this.$emit("room-is-booked")
        } catch (error) {
          console.log(error)
          if (_.get(error, ["response", "data", "messages"])) {
            this.errors = error.response.data.messages
          } else {
            this.errors = ["Network error, contact management to resolve the issue"]
          }
          this.bookRoomFormState = "fail-try-again"
        }
      },
      editCustomerDetails: async function(bookingForm) {
        try {
          this.editCustomerDetailsFormState = "loading"
          let url = `api/bookings/${this.booking.id}`
          let response = await this.$httpClient.patch(url, {
            customer_details: bookingForm,
          })

          this.booking.customer_details = response.data.customer_details
          this.editCustomerDetailsFormState = "initialize"
          this.success.push("Successfully Edited Customer Details")
          this.$emit("room-booking-is-edited")
        } catch (error) {
          if (_.get(error, ["response", "data", "messages"])) {
            this.errors = error.response.data.messages
          } else {
            this.errors = ["Network error, contact management to resolve the issue"]
          }
          this.editCustomerDetailsFormState = "fail-try-again"
        }
      },

      collectPayment: function(paymentDetails) {
        this.collectCashPaymentState = "success-try-again"
      },
      isBookingFormValid() {},
    },
  }
</script>

<template>
  <div>
    <SuccessFailureAlert :success="success" :errors="errors"></SuccessFailureAlert>

    <div class="pt-3" v-if="booking === null">
      <BookingForm :state="bookRoomFormState" @save-booking="bookRoom"></BookingForm>
    </div>

    <div class="text-center">
      <div v-if="booking !== null" class="row">
        <div class="col-12 col-lg-4 mt-4">
          <div class="text-left mt-1 mb-4">
            <h5>Edit Booking Details</h5>
            <BookingForm
              :booking="booking"
              :state="editCustomerDetailsFormState"
              @save-booking="editCustomerDetails"
            ></BookingForm>
          </div>
        </div>
        <div class="col-12 col-lg-4 mt-4">
          <b-card-header>
            Booking Details
          </b-card-header>
          <b-card-body class="text-left">
            <table class="table table-responsive table-hover">
              <tbody>
                <tr>
                  <td class="font-weight-semibold">Booking Date:</td>
                  <td> {{ booking.start_date | humanDate }}</td>
                </tr>
                <tr>
                  <td class="font-weight-semibold">Booking Time:</td>
                  <td> {{ booking.created_at | humanTime }}</td>
                </tr>
                <tr>
                  <td class="font-weight-semibold">Price per Night:</td>
                  <td> {{ booking.price_per_night | money }}</td>
                </tr>
                <tr>
                  <td class="font-weight-semibold">Room Details:</td>
                  <td> {{ room.room.room_type.name.toUpperCase() }} {{ room.room.room_no }}</td>
                </tr>
                <tr>
                  <td class="font-weight-semibold">Guest Name:</td>
                  <td>{{ booking.customer_details.name }}</td>
                </tr>
                <tr>
                  <td class="font-weight-semibold">Guest Phone:</td>
                  <td> {{ booking.customer_details.phone }}</td>
                </tr>
                <tr>
                  <td class="font-weight-semibold">Guest Address:</td>
                  <td> {{ booking.customer_details.address }}</td>
                </tr>
                <tr>
                  <td class="font-weight-semibold">Guest Email Address:</td>
                  <td> {{ booking.customer_details.emailAddress }}</td>
                </tr>
                <tr>
                  <td class="font-weight-semibold">Guest Next of Kin:</td>
                  <td> {{ booking.customer_details.nextOfKin }}</td>
                </tr>
                <tr>
                  <td class="font-weight-semibold">Number of Guests:</td>
                  <td> {{ booking.customer_details.numberOfGuests }}</td>
                </tr>
                <tr>
                  <td class="font-weight-semibold">Intended Number of Nights:</td>
                  <td> {{ booking.customer_details.intendedNumberOfNights }}</td>
                </tr>
                <tr>
                  <td class="font-weight-semibold">Nationality:</td>
                  <td> {{ booking.customer_details.nationality }}</td>
                </tr>
              </tbody>
            </table>
          </b-card-body>
        </div>
        <CollectCashPayment
          :state="collectCashPaymentState"
          class="col-12 col-lg-4"
          :required-amount="amountDue"
          @success="collectPayment"
          sellable-type="booking"
          :sellableId="booking.id"
        ></CollectCashPayment>
      </div>
    </div>
  </div>
</template>
