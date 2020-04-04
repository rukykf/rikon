<script>
import axios from "axios"
import { DateTime, Interval } from "luxon"
import ManagedStateButton from "../../../../../components/managed-state-button"

export default {
	name: "close-reservation",
	components: { ManagedStateButton },
	props: {
		room: {
			type: Object,
			required: true,
		},
	},
	data: function() {
		return {
			reservation: null,
			success: [],
			errors: [],
		}
	},
	mounted: function() {
		this.getReservation()
	},
	methods: {
		getReservation: async function() {
			let reservationData = await axios.get("http://localhost:3000/reservation")
			let reservation = reservationData.data
			reservation.friendlyStartDate = DateTime.fromISO(reservation.startDate).toLocaleString(DateTime.DATE_HUGE)
			reservation.friendlyEndDate = DateTime.fromISO(reservation.endDate).toLocaleString(DateTime.DATE_HUGE)
			let expiresIn = Interval.fromDateTimes(DateTime.local(), DateTime.fromISO(reservation.startDate))
				.length("hours")
				.toFixed(0)
			reservation.expiresIn = isNaN(expiresIn) ? "Already Expired" : expiresIn.concat(" hours")
			console.log(reservation)
			this.reservation = reservation
		},
		closeReservation: function() {
			this.buttons.closeReservationBtn.loading = true
			setTimeout(() => {
				this.success.push("Successfully closed reservation")
				this.buttons.closeReservationBtn.loading = false
				this.buttons.closeReservationBtn.disabled = true
				this.buttons.closeReservationBtn.variant = "success"
				this.buttons.closeReservationBtn.title = "Successfully closed reservation"
				this.buttons.closeReservationBtn.icon = "check"
				this.$emit("update-room-status")
			}, 2000)
		},
	},
}
</script>

<template>
	<div>
		<div>
			<b-card-header class="font-weight-semibold">
				Reservation Details
			</b-card-header>
			<b-card-body class="text-left">
				<table class="table table-borderless table-hover">
					<tbody>
						<tr>
							<td class="font-weight-semibold">Customer Name:</td>
							<td> {{ reservation.customerName }}</td>
						</tr>
						<tr>
							<td class="font-weight-semibold">Start Date:</td>
							<td> {{ reservation.friendlyStartDate }}</td>
						</tr>

						<tr>
							<td class="font-weight-semibold">End Date:</td>
							<td> {{ reservation.friendlyEndDate }}</td>
						</tr>
						<tr>
							<td class="font-weight-semibold">Expires in:</td>
							<td> {{ reservation.expiresIn }}</td>
						</tr>
					</tbody>
				</table>
			</b-card-body>
		</div>

		<div class="text-center">
			<ManagedStateButton state="initialize" mainTitle="Close Reservation" mainVariant="dark"></ManagedStateButton>
		</div>
	</div>
</template>
