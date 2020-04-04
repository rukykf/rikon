<script>
import { DateTime, Interval } from "luxon"
import BookRoom from "./book-room"

import UpcomingReservations from "./upcoming-reservations"
import CloseRoomBooking from "./close-room-booking"
import CloseReservation from "./close-reservation"

export default {
	name: "room-pop-up",
	components: { CloseReservation, CloseRoomBooking, UpcomingReservations, BookRoom },
	props: {
		room: {
			type: Object,
			required: true,
		},
	},
	data: function() {
		return {
			errors: [],
			success: [],
			tabs: ["upcoming reservations"],
			currentTab: "loading",
		}
	},
	computed: {
		currentDate: function() {
			console.log(DateTime.local().toISO())
			return DateTime.local().toISODate()
		},
		bookingStartDate: function() {
			if (this.roomDetails.booking) {
				return DateTime.fromISO(this.roomDetails.booking.startDate).toLocaleString(DateTime.DATE_FULL)
			}
			return ""
		},
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
		this.currentTab = "loading"
		setTimeout(() => {
			console.log("hello")
			this.currentTab = this.tabs[0]
		}, 1900)
		if (this.room.status === "reserved") {
			this.tabs.unshift("current reservation")
		}
		if (this.room.status === "available") {
			this.tabs.unshift("book room")
		}
		if (this.room.status === "booked") {
			this.tabs.unshift("booking")
		}
	},
	methods: {},
}
</script>
<template>
	<div>
		<b-nav tabs justified>
			<b-nav-item v-for="tab in tabs" :key="tab" :active="currentTab === tab" @click="currentTab = tab">
				<h5 :class="currentTab === tab ? 'font-weight-bold' : 'font-weight-normal'">{{
					tab[0].toUpperCase() + tab.slice(1)
				}}</h5>
			</b-nav-item>
		</b-nav>

		<div class="mt-3">
			<b-alert v-for="error in errors" :key="error" variant="danger" show dismissible>
				<feather type="alert-triangle" class="align-middle mr-1"></feather>
				<span class="align-middle">{{ error }}</span>
			</b-alert>

			<b-alert v-for="message in success" :key="message" variant="success" show dismissible>
				<feather type="check" class="align-middle mr-1"></feather>
				<span class="align-middle">{{ message }}</span>
			</b-alert>
		</div>

		<div class="text-center m-5" v-if="currentTab === 'loading'">
			<b-spinner variant="primary" label="Spinning"></b-spinner>
		</div>

		<div v-else-if="currentTab === 'book room'">
			<BookRoom :room="room"></BookRoom>
		</div>
		<div v-else-if="currentTab === 'upcoming reservations'">
			<UpcomingReservations :room="room"></UpcomingReservations>
		</div>
		<div v-else-if="currentTab === 'booking'">
			<CloseRoomBooking :room="room"></CloseRoomBooking>
		</div>
		<div v-else-if="currentTab === 'current reservation'">
			<CloseReservation :room="room"></CloseReservation>
		</div>
	</div>
</template>

<style scoped></style>
