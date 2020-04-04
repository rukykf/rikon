<script>
import CollectPayment from "@src/components/collect-payment"

export default {
	name: "close-room-booking",
	components: { CollectPayment },
	props: {
		room: {
			type: Object,
			required: true,
		},
	},
	data: function() {
		return {
			booking: {
				bookingId: 20,
				roomId: 100,
				startDate: "2020-03-10T11:26:51.416+01:00",
				costPerNight: "5000",
				amountPaid: 0,
			},
		}
	},
	methods: {
		closeBooking: function() {
			console.log("close booking")
		},
		saveBookingPayment: function() {
			console.log("save booking payment")
		},
	},
}
</script>

<template>
	<div class="row">
		<div class="col-12 col-lg-6">
			<b-card-header>
				Booking Details
			</b-card-header>
			<b-card-body class="text-left">
				<table class="table table-responsive table-hover">
					<tbody>
						<tr>
							<td class="font-weight-semibold">Start Date:</td>
							<td> March 20th, 2020</td>
						</tr>
						<tr>
							<td class="font-weight-semibold">Close Date (i.e Today):</td>
							<td> March 24th, 2020</td>
						</tr>
						<tr>
							<td class="font-weight-semibold">Cost per night:</td>
							<td> {{ booking.costPerNight }}</td>
						</tr>
						<tr>
							<td class="font-weight-semibold">Amount Paid(N):</td>
							<td> {{ booking.amountPaid }}</td>
						</tr>
						<tr>
							<td class="font-weight-semibold">Total due:</td>
							<td> 7000 </td>
						</tr>
						<tr>
							<td class="font-weight-semibold">Number of nights: </td>
							<td> 3 </td>
						</tr>
					</tbody>
				</table>
			</b-card-body>
			<div class="row text-center">
				<div class="col-12">
					<b-button @click="closeBooking">Close Booking</b-button>
				</div>
			</div>
		</div>
		<CollectPayment take-credit class="col-12 col-lg-5 ml-3" @submit-payment="saveBookingPayment"></CollectPayment>
	</div>
</template>
