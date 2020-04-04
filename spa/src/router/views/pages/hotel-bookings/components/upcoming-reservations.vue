<script>
import axios from "axios"
import { DateTime, Interval } from "luxon"
import ManagedStateButton from "../../../../../components/managed-state-button"
import SuccessFailureAlert from "../../../../../components/success-failure-alert"

export default {
	name: "upcoming-reservations",
	components: { SuccessFailureAlert, ManagedStateButton },
	props: {
		room: {
			type: Object,
			required: true,
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
			let reservationsData = await axios.get("http://localhost:3000/reservations")
			let reservations = reservationsData.data.reservations
			reservations.forEach(function(e) {
				e.friendlyStartDate = DateTime.fromISO(e.startDate).toLocaleString(DateTime.DATE_HUGE)
				e.friendlyEndDate = DateTime.fromISO(e.endDate).toLocaleString(DateTime.DATE_HUGE)
				e.expiresIn = Interval.fromDateTimes(DateTime.local(), DateTime.fromISO(e.startDate))
					.length("days")
					.toFixed(0)
			})
			this.reservations = reservations
		},
		createNewReservation: function() {
			console.log("hello")
			if (this.validateReservationForm()) {
				this.createNewReservationBtnState = "loading"
				setTimeout(() => {
					this.createNewReservationBtnState = "success"
					this.success.push("Successfully reserved room ".concat(this.room.room_no))
				}, 800)
			}
		},

		validateReservationForm: function() {
			if (DateTime.local() >= DateTime.fromISO(this.newReservation.reservationStart)) {
				this.newReservation.validationMessage = "You cannot create a reservation for today or a day before today"
				return false
			}

			if (DateTime.fromISO(this.newReservation.reservationStart) > DateTime.fromISO(this.newReservation.reservationEnd)) {
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

			return true
		},
	},
}
</script>
<template>
	<div class="row">
		<SuccessFailureAlert :success="success" :errors="errors"></SuccessFailureAlert>
		<div class="col-12 col-lg-6">
			<h4 class="mb-3">Upcoming reservations</h4>
			<table class="table table-responsive table-hover">
				<thead>
					<tr>
						<th>Customer Name</th>
						<th>Reservation starts</th>
						<th>Reservation ends</th>
						<th>Reservation expires in</th>
					</tr>
				</thead>
				<p v-if="reservations === null" class="pl-3">
					There are currently no upcoming reservations for this room
				</p>
				<tbody v-else>
					<tr v-for="reservation in reservations" :key="reservation.id">
						<td>{{ reservation.customerName }}</td>
						<td>{{ reservation.friendlyStartDate }}</td>
						<td>{{ reservation.friendlyEndDate }}</td>
						<td>{{ reservation.expiresIn }} days from now</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div class="col-12 col-lg-6">
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
				<input readonly type="text" class="form-control bg-info" id="reservationNIghts" :value="newReservationNights" />
			</div>
			<ManagedStateButton
				:state="createNewReservationBtnState"
				mainTitle="Save Reservation"
				@clicked="createNewReservation"
			></ManagedStateButton>
		</div>
	</div>
</template>
