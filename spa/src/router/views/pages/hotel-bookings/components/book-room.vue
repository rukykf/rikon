<script>
import ManagedStateButton from "../../../../../components/managed-state-button"
import CollectCashPayment from "@src/components/collect-cash-payment"
import SuccessFailureAlert from "../../../../../components/success-failure-alert"

export default {
	name: "book-room",
	components: { SuccessFailureAlert, ManagedStateButton, CollectCashPayment },
	props: {
		room: {
			type: Object,
			required: true,
		},
	},
	data: function() {
		return {
			bookRoomBtnState: "initialize",
			booking: null,
			collectCashPaymentState: "initialize",
			success: [],
			errors: [],
		}
	},
	methods: {
		bookRoom: function() {
			this.bookRoomBtnState = "loading"
			setTimeout(() => {
				this.booking = {
					bookingId: 20,
					roomId: 100,
					startDate: "March 1st, 2020",
					costPerNight: "5000",
					amountPaid: 0,
				}
				this.bookRoomBtnState = "success"
				this.success.push("Successfully Booked Room ".concat(this.room.room_no))
				this.$emit("room-is-booked")
			}, 2000)
		},
		collectPayment: function(paymentDetails) {
			this.collectCashPaymentState = "loading"
			setTimeout(() => {
				this.collectCashPaymentState = "success"
			}, 800)
		},
	},
}
</script>

<template>
	<div>
		<div class="text-center">
			<SuccessFailureAlert :success="success" :errors="errors"></SuccessFailureAlert>

			<ManagedStateButton
				:state="bookRoomBtnState"
				mainTitle="Book Room"
				@clicked="bookRoom"
				mainVariant="dark"
			></ManagedStateButton>
			<div v-if="booking !== null" class="row">
				<div class="col-12 col-lg-6 mt-4">
					<b-card-header>
						Booking Details
					</b-card-header>
					<b-card-body class="text-left">
						<table class="table table-responsive table-hover">
							<tbody>
								<tr>
									<td class="font-weight-semibold">Start Date:</td>
									<td> {{ booking.startDate }}</td>
								</tr>
								<tr>
									<td class="font-weight-semibold">Cost per night:</td>
									<td> {{ booking.costPerNight }}</td>
								</tr>
								<tr>
									<td class="font-weight-semibold">Amount Paid(N):</td>
									<td> {{ booking.amountPaid }}</td>
								</tr>
							</tbody>
						</table>
					</b-card-body>
				</div>
				<CollectCashPayment
					:state="collectCashPaymentState"
					class="col-12 col-lg-6"
					@clicked="collectPayment"
				></CollectCashPayment>
			</div>
		</div>
	</div>
</template>
