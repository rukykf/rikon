<script>
export default {
	name: "display-customer-booking-details",
	props: {
		details: {
			type: Object,
			required: true,
		},
	},
}
</script>

<template>
	<div>
		<b-row class="mb-2">
			<b-col sm="3" class="text-sm-right"><b>Guest Name: </b></b-col>
			<b-col>{{ details.customer_details.name }}</b-col>
		</b-row>
		<b-row class="mb-2">
			<b-col sm="3" class="text-sm-right text-info"><b>Guest's Intended Number of Nights: </b></b-col>
			<b-col>{{ details.customer_details.intendedNumberOfNights }}</b-col>
		</b-row>
		<b-row class="mb-2">
			<b-col sm="3" class="text-sm-right text-success"><b>Actual Number of Nights (calculated by the system): </b></b-col>
			<b-col>{{ details.num_nights }}</b-col>
		</b-row>
		<b-row class="mb-2">
			<b-col sm="3" class="text-sm-right"><b>Booking Started:</b></b-col>
			<b-col>{{ details.start_date | humanDate }}</b-col>
		</b-row>
		<b-row class="mb-2">
			<b-col sm="3" class="text-sm-right"><b>Booking Ended:</b></b-col>
			<b-col>{{ details.end_date | humanDate }}</b-col>
		</b-row>
		<b-row class="mb-2">
			<b-col sm="3" class="text-sm-right"><b>Price per Night:</b></b-col>
			<b-col>{{ details.price_per_night | money }}</b-col>
		</b-row>
		<b-row class="mb-2">
			<b-col sm="3" class="text-sm-right"><b>Room Number:</b></b-col>
			<b-col>{{ details.room.room_no }}</b-col>
		</b-row>
		<b-row class="mb-2">
			<b-col sm="3" class="text-sm-right"><b>Status: </b></b-col>
			<b-col>{{ details.status }}</b-col>
		</b-row>
		<b-row class="mb-2">
			<b-col sm="3" class="text-sm-right"><b>Guest's Phone: </b></b-col>
			<b-col>{{ details.customer_details.phone }}</b-col>
		</b-row>
		<b-row class="mb-2">
			<b-col sm="3" class="text-sm-right"><b>Guest's Address: </b></b-col>
			<b-col>{{ details.customer_details.address }}</b-col>
		</b-row>
		<b-row class="mb-2">
			<b-col sm="3" class="text-sm-right"><b>Guest's Email Address: </b></b-col>
			<b-col>{{ details.customer_details.emailAddress }}</b-col>
		</b-row>
		<b-row class="mb-2">
			<b-col sm="3" class="text-sm-right"><b>Guest's Next of Kin: </b></b-col>
			<b-col>{{ details.customer_details.nextOfKin }}</b-col>
		</b-row>
		<b-row class="mb-2">
			<b-col sm="3" class="text-sm-right"><b>Number of Guests: </b></b-col>
			<b-col>{{ details.customer_details.numberOfGuests }}</b-col>
		</b-row>
		<b-row class="mb-2">
			<b-col sm="3" class="text-sm-right"><b>Guest's Nationality: </b></b-col>
			<b-col>{{ details.customer_details.nationality }}</b-col>
		</b-row>
	</div>
</template>
<style scoped></style>
