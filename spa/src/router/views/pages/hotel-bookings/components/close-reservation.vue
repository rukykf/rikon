<script>
import { DateTime, Interval } from "luxon"
import ManagedStateButton from "../../../../../components/managed-state-button"
import ErrorHandler from "@src/ErrorHandler"
import SuccessFailureAlert from "../../../../../components/success-failure-alert"

export default {
 name: "close-reservation",
 components: { SuccessFailureAlert, ManagedStateButton },
 props: {
  room: {
   type: Object,
   required: false,
  },
 },
 data: function() {
  return {
   reservation: null,
   success: [],
   errors: [],
   reservationIsExpired: false,
   closeReservationBtnState: "initialize",
  }
 },
 computed: {
  numberOfNights: function() {
   if (this.reservation === null) {
    return 0
   }
   let startDate = DateTime.fromISO(this.reservation.start_date)
   let endDate = DateTime.fromISO(this.reservation.end_date)

   let nights = Interval.fromDateTimes(startDate, endDate)
   if (nights.length("days") < 1) {
    return 1
   }
   return nights.length("days")
  },
 },
 mounted: function() {
  this.getReservation()
 },
 methods: {
  getReservation: async function() {
   try {
    let url = `api/hotel-rooms/${this.room.room.id}/reservation`
    let response = await this.$httpClient.get(url)
    this.reservation = response.data
    if (
     DateTime.local().toLocaleString(DateTime.TIME_SIMPLE) >= "12:00 PM" &&
     DateTime.local().toLocaleString(DateTime.TIME_SIMPLE) <= "9:00 PM"
    ) {
     this.reservationIsExpired = true
    }
   } catch (error) {
    let errors = ErrorHandler(error)
    this.errors.push(...errors)
   }
  },
  closeReservation: async function() {
   if (this.reservation === null) {
    return
   }

   try {
    this.closeReservationBtnState = "loading"
    let url = `api/reservations/${this.reservation.id}`
    await this.$httpClient.patch(url, {
     status: "closed",
    })
    this.success.push(`Successfully closed reservation for ${this.reservation.customer_details.name}`)
    this.closeReservationBtnState = "success"
   } catch (error) {
    let errors = ErrorHandler(error)
    this.errors.push(...errors)
   }
  },
 },
}
</script>

<template>
 <div>
  <div>
   <SuccessFailureAlert :success="success" :errors="errors"></SuccessFailureAlert>
   <b-card-header class="font-weight-semibold">
    Reservation Details
   </b-card-header>
   <b-card-body class="text-left">
    <table class="table table-borderless table-hover">
     <tbody>
      <tr>
       <td class="font-weight-semibold">Customer Name:</td>
       <td> {{ reservation.customer_details.name }}</td>
      </tr>
      <tr>
       <td class="font-weight-semibold">Customer Phone:</td>
       <td> {{ reservation.customer_details.phone }}</td>
      </tr>
      <tr>
       <td class="font-weight-semibold">Start Date:</td>
       <td> {{ reservation.start_date | humanDate }}</td>
      </tr>

      <tr>
       <td class="font-weight-semibold">End Date:</td>
       <td> {{ reservation.end_date | humanDate }}</td>
      </tr>

      <tr>
       <td class="font-weight-semibold">Number of Nights:</td>
       <td> {{ numberOfNights }}</td>
      </tr>
     </tbody>
    </table>
   </b-card-body>
  </div>

  <div class="text-center">
   <ManagedStateButton
    :state="closeReservationBtnState"
    mainTitle="Close Reservation"
    mainVariant="dark"
    @clicked="closeReservation"
   ></ManagedStateButton>
  </div>
 </div>
</template>
