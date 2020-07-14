<script>
  import { DateTime, Interval } from "luxon"
  import _ from "lodash"
  import ManagedStateButton from "../../../../../components/managed-state-button"
  import SuccessFailureAlert from "../../../../../components/success-failure-alert"
  import ErrorHandler from "@src/ErrorHandler"

  export default {
    name: "upcoming-reservations",
    components: { SuccessFailureAlert, ManagedStateButton },
    props: {
      room: {
        type: Object,
        required: false,
      },
    },
    data: function() {
      return {
        reservations: null,
        newReservation: {
          customerName: "",
          customerPhone: "",
          reservationStart: DateTime.local(),
          reservationEnd: DateTime.local(),
          validationMessage: null,
        },
        createNewReservationBtnState: "initialize",
        success: [],
        errors: [],
      }
    },
    computed: {
      newReservationNights: function() {
        let nights = Interval.fromDateTimes(
          DateTime.fromISO(this.newReservation.reservationStart),
          DateTime.fromISO(this.newReservation.reservationEnd)
        )
          .length("days")
          .toFixed(0)
        return isNaN(nights) ? 0 : nights
      },
    },
    mounted: function() {
      this.getReservations()
    },

    methods: {
      getReservations: async function() {
        try {
          let url = `api/hotel-rooms/${this.room.room.id}/reservations?status=open`
          let response = await this.$httpClient.get(url)
          let reservations = response.data
          reservations.forEach(function(e) {
            if (DateTime.local().toISODate() >= DateTime.fromISO(e.start_date).toISODate()) {
              e.expiresIn = "today"
            } else {
              let days = Interval.fromDateTimes(DateTime.local(), DateTime.fromISO(e.start_date))
                .length("days")
                .toFixed(0)
              e.expiresIn = `${days} days from now`

              if (days < 1) {
                e.expiresIn = "1 day from now"
              }
            }
          })
          this.reservations = reservations
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },
      createNewReservation: async function() {
        if (!this.validateReservationForm()) {
          return
        }

        try {
          this.createNewReservationBtnState = "loading"
          let url = `api/hotel-rooms/${this.room.room.id}/reservations`
          await this.$httpClient.post(url, {
            start_date: this.newReservation.reservationStart,
            end_date: this.newReservation.reservationEnd,
            customer_details: {
              name: this.newReservation.customerName,
              phone: this.newReservation.customerPhone,
            },
          })
          // display success message and reload the reservations list
          this.success.push("Successfully reserved room")
          this.createNewReservationBtnState = "success-try-again"
          this.getReservations()
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
          this.createNewReservationBtnState = "fail-try-again"
        }
      },
      cancelReservation: async function(reservation) {
        try {
          event.target.innerText = "Loading..."
          let url = `api/reservations/${reservation.id}`
          await this.$httpClient.patch(url, {
            status: "cancelled",
          })
          this.success.push(`Successfully cancelled reservation for ${reservation.customer_details.name}`)
          this.getReservations()
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },
      validateReservationForm: function() {
        if (DateTime.local() >= DateTime.fromISO(this.newReservation.reservationStart)) {
          this.newReservation.validationMessage = "You cannot create a reservation for today or a day before today"
          return false
        }

        if (
          DateTime.fromISO(this.newReservation.reservationStart) > DateTime.fromISO(this.newReservation.reservationEnd)
        ) {
          this.newReservation.validationMessage = "The reservation cannot end before it starts"
          return false
        }

        if (this.newReservation.customerName.length < 1) {
          this.newReservation.validationMessage = "The customer name is required"
          return false
        }

        if (this.newReservation.customerPhone.length !== 11) {
          this.newReservation.validationMessage = "Please enter a valid 11 digit phone number"
          return false
        }

        this.newReservation.validationMessage = null
        return true
      },
    },
  }
</script>
<template>
  <div>
    <SuccessFailureAlert :success="success" :errors="errors"></SuccessFailureAlert>
    <div class="row">
      <div class="col-12 col-lg-7">
        <h4 class="mb-3">Upcoming reservations</h4>
        <table class="table table-responsive table-hover">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Customer Phone</th>
              <th>Reservation starts</th>
              <th>Reservation ends</th>
              <th>Reservation expires in</th>
              <th>Action</th>
            </tr>
          </thead>
          <p v-if="reservations === null || reservations.length === 0" class="pl-3">
            There are currently no upcoming reservations for this room
          </p>
          <tbody v-else>
            <tr v-for="reservation in reservations" :key="reservation.id">
              <td>{{ reservation.customer_details.name }}</td>
              <td>{{ reservation.customer_details.phone }}</td>
              <td>{{ reservation.start_date | humanDate }}</td>
              <td>{{ reservation.end_date | humanDate }}</td>
              <td>{{ reservation.expiresIn }}</td>
              <td>
                <ManagedStateButton
                  state="initialize"
                  main-variant="dark"
                  mainTitle="Cancel"
                  @clicked="cancelReservation(reservation)"
                  :key="reservation.id"
                ></ManagedStateButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col-12 col-lg-5">
        <h4 class="mb-3">Create a new reservation</h4>
        <span class="text-danger" v-if="newReservation.validationMessage !== null"
          >*Error: {{ newReservation.validationMessage }}</span
        >
        <div class="form-group">
          <label for="customerName">Customer Name: </label>
          <input type="text" class="form-control" id="customerName" v-model="newReservation.customerName" />
        </div>
        <div class="form-group">
          <label for="customerPhone">Phone Number: </label>
          <input type="text" class="form-control" id="customerPhone" v-model="newReservation.customerPhone" />
        </div>
        <div class="form-group">
          <label for="reservationStartDate">Reservation Starts: </label>
          <input type="date" class="form-control" id="reservationStartDate" v-model="newReservation.reservationStart" />
        </div>
        <div class="form-group">
          <label for="reservationEndDate">Reservation Ends: </label>
          <input type="date" class="form-control" id="reservationEndDate" v-model="newReservation.reservationEnd" />
        </div>
        <div class="form-group">
          <label for="reservationNights">Number of Nights: </label>
          <input
            readonly
            type="text"
            class="form-control bg-info"
            id="reservationNIghts"
            :value="newReservationNights"
          />
        </div>
        <ManagedStateButton
          :state="createNewReservationBtnState"
          mainTitle="Save Reservation"
          @clicked="createNewReservation"
          success-try-again-title="Save Another Reservation"
        ></ManagedStateButton>
      </div>
    </div>
  </div>
</template>
