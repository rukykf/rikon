<script>
  import ErrorHandler from "@src/ErrorHandler"
  import SuccessFailureAlert from "../../../../../components/success-failure-alert"
  import { DateTime, Interval } from "luxon"
  import _ from "lodash"
  import ManagedStateButton from "@src/components/managed-state-button"
  import BookingForm from "./booking-form"
  import CollectBookingPayment from "@components/collect-payment/collect-booking-payment"
  import FormBackground from "@components/form-background"
  import DisplayBookingPaymentDetails from "@views/pages/hotel-bookings/components/display-booking-payment-details"

  export default {
    name: "close-room-booking",
    components: {
      DisplayBookingPaymentDetails,
      FormBackground,
      CollectBookingPayment,
      BookingForm,
      SuccessFailureAlert,
      ManagedStateButton,
    },
    props: {
      room: {
        type: Object,
        required: false,
      },
    },
    data: function() {
      return {
        booking: { id: 0, customer_details: {} },
        errors: [],
        success: [],
        editBookingFormState: "initialize",
        collectPaymentFormState: "initialize",
        closeBookingBtnState: "initialize",
      }
    },
    computed: {
      numberOfNights: function() {
        return this.getNumberOfNights()
      },
      totalCharge: function() {
        return this.getTotalCharge()
      },
      totalPaid: function() {
        return this.getTotalPaid()
      },
      totalDue: function() {
        return this.getTotalDue()
      },
      totalDiscount: function() {
        return this.getTotalDiscount()
      },
      paymentStatus: function() {
        return this.getTotalDue() === 0 ? "FULLY PAID" : "NEEDS PAYMENT"
      },
    },
    mounted: function() {
      this.getBooking()
    },
    methods: {
      getNumberOfNights: function() {
        if (this.booking === null) {
          return 0
        }
        let startDate = DateTime.fromISO(this.booking.start_date)
        let endDate = DateTime.fromISO(this.booking.end_date)

        let nights = Interval.fromDateTimes(startDate, endDate)
        if (nights.length("days") < 1) {
          return 1
        }
        return nights.length("days")
      },
      getBooking: async function() {
        try {
          let url = `api/hotel-rooms/${this.room.room.id}/booking`
          let response = await this.$httpClient.get(url)
          this.booking = response.data
          if (this.booking === "") {
            this.booking = null
            this.success.push("this booking has already been closed")
          }
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },
      getTotalCharge: function() {
        return this.getNumberOfNights() * this.booking.price_per_night
      },
      getTotalPaid: function() {
        if (_.get(this.booking, ["sale", "total_paid"])) {
          return this.booking.sale.total_paid
        }
        return 0
      },
      getTotalDiscount: function() {
        if (_.get(this.booking, ["sale", "total_complementary"])) {
          return this.booking.sale.total_complementary
        }
        return 0
      },
      getTotalDue: function() {
        return this.getTotalCharge() - (this.getTotalPaid() + this.getTotalDiscount())
      },
      closeBooking: async function() {
        try {
          this.closeBookingBtnState = "loading"
          let url = `api/bookings/${this.booking.id}`
          await this.$httpClient.post(url)
          this.success.push("Successfully closed booking")
          this.closeBookingBtnState = "success"
          this.collectPaymentFormState = "success"
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
          this.closeBookingBtnState = "fail-try-again"
        }
      },
      editGuestDetailsForBooking: async function(bookingForm) {
        try {
          this.editBookingFormState = "loading"
          let url = `api/bookings/${this.booking.id}`
          let response = await this.$httpClient.patch(url, {
            customer_details: bookingForm,
          })

          this.booking.customer_details = response.data.customer_details
          this.editBookingFormState = "initialize"
          this.success.push("Successfully Edited Customer Details")
          this.$emit("room-booking-is-edited")
        } catch (error) {
          if (_.get(error, ["response", "data", "messages"])) {
            this.errors = error.response.data.messages
          } else {
            this.errors = ["Network error, contact management to resolve the issue"]
          }
          this.editBookingFormState = "fail-try-again"
        }
      },
      updatedStateOnSuccessfulPayment: function(updatedPaymentDetails) {
        this.booking.sale = updatedPaymentDetails
      },

      paymentFailed: function() {
        this.collectPaymentFormState = "fail-try-again"
      },
    },
  }
</script>

<template>
  <div class="">
    <SuccessFailureAlert :errors="errors" :success="success" class="col-12"></SuccessFailureAlert>

    <div v-if="booking !== null">
      <b-card no-body>
        <b-tabs pills card vertical nav-class="col-12" nav-wrapper-class="col-5 col-lg-3 p-2">
          <b-tab title-item-class="m-2" title-link-class="btn btn-dark" title="Close Booking" active>
            <div class="">
              <ManagedStateButton
                class="mt-2"
                :state="closeBookingBtnState"
                mainTitle="Click to Close Booking"
                fail-try-again-title="Click to Close Booking"
                mainVariant="dark"
                @clicked="closeBooking"
              ></ManagedStateButton>
            </div>
            <DisplayBookingPaymentDetails
              :booking="booking"
              :total-charge="totalCharge"
              :total-paid="totalPaid"
              :total-balance="totalDue"
              :total-discount="totalDiscount"
              class="mt-3"
            ></DisplayBookingPaymentDetails>
            <FormBackground class="text-center">
              <CollectBookingPayment
                :booking-id="booking.id"
                :required-amount="totalDue"
                :state="collectPaymentFormState"
                @success="updatedStateOnSuccessfulPayment"
              ></CollectBookingPayment>
            </FormBackground>
          </b-tab>
          <b-tab title-item-class="m-2" title-link-class="btn btn-dark" title="Show Booking Details">
            <b-card-header>
              <h4>Booking Details</h4>
            </b-card-header>
            <b-card-body class="text-left">
              <table class="table table-responsive table-hover">
                <tbody>
                  <tr>
                    <td class="font-weight-semibold">Room Number:</td>
                    <td> {{ room.room.room_no }}</td>
                  </tr>

                  <tr>
                    <td class="font-weight-semibold">Guest Name:</td>
                    <td>{{ booking.customer_details.name }}</td>
                  </tr>

                  <tr>
                    <td class="font-weight-semibold">Start Date / Time:</td>
                    <td> {{ booking.start_date | humanDate }} at {{ booking.created_at | humanTime }}</td>
                  </tr>
                  <tr>
                    <td class="font-weight-semibold">End Date (i.e if booking closes today):</td>
                    <td> {{ booking.end_date | humanDate }}</td>
                  </tr>
                  <tr>
                    <td class="font-weight-semibold">Price per Night:</td>
                    <td> {{ booking.price_per_night | money }}</td>
                  </tr>
                  <tr>
                    <td class="font-weight-bold">Actual Number of Nights (calculated by the system): </td>
                    <td> {{ numberOfNights }}</td>
                  </tr>
                  <tr>
                    <td class="font-weight-bold">Guest's Intended Number of Nights:</td>
                    <td> {{ booking.customer_details.intendedNumberOfNights }}</td>
                  </tr>
                  <tr>
                    <td class="font-weight-bold">Total Charge:</td>
                    <td> {{ totalCharge | money }}</td>
                  </tr>
                  <tr>
                    <td class="font-weight-bold">Amount Paid:</td>
                    <td> {{ totalPaid | money }}</td>
                  </tr>
                  <tr>
                    <td class="font-weight-semibold">Total Discount:</td>
                    <td> {{ totalDiscount | money }}</td>
                  </tr>
                  <tr>
                    <td class="font-weight-semibold">Balance Due:</td>
                    <td> {{ totalDue | money }}</td>
                  </tr>
                  <tr>
                    <td class="font-weight-semibold">Payment Status:</td>
                    <td> {{ paymentStatus }}</td>
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
                    <td class="font-weight-semibold">Nationality:</td>
                    <td> {{ booking.customer_details.nationality }}</td>
                  </tr>
                </tbody>
              </table>
            </b-card-body>
          </b-tab>
          <b-tab title-item-class="m-2" title-link-class="btn btn-dark" title="Edit Booking / Guest Details">
            <h4>Edit Guest Details for this Booking</h4>
            <BookingForm
              :booking="booking"
              :state="editBookingFormState"
              @save-booking="editGuestDetailsForBooking"
            ></BookingForm>
          </b-tab>
        </b-tabs>
      </b-card>
    </div>
  </div>
</template>
