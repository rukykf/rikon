<script>
import CollectPayment from "@src/components/collect-payment"
import ErrorHandler from "@src/ErrorHandler"
import SuccessFailureAlert from "../../../../../components/success-failure-alert"
import { DateTime, Interval } from "luxon"
import _ from "lodash"
import ManagedStateButton from "@src/components/managed-state-button"

export default {
	name: "close-room-booking",
	components: { SuccessFailureAlert, CollectPayment, ManagedStateButton },
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
		paymentSucceessful: function() {
			this.collectPaymentFormState = "success"
		},

		paymentFailed: function() {
			this.collectPaymentFormState = "fail-try-again"
		},
	},
}
</script>

<template>
	<div class="row">
		<SuccessFailureAlert :errors="errors" :success="success" class="col-12"></SuccessFailureAlert>
		<div class="col-12 col-lg-6">
			<b-card-header>
				Booking Details
			</b-card-header>
			<b-card-body class="text-left">
				<table class="table table-responsive table-hover">
					<tbody>
						<tr>
							<td class="font-weight-semibold">Room Number:</td>
							<td> {{ room.room.room_no }}</td>
						</tr>
						<tr>
							<td class="font-weight-semibold">Customer Name:</td>
							<td> {{ booking.customer_details.name }}</td>
						</tr>

						<tr>
							<td class="font-weight-semibold">Customer Phone:</td>
							<td> {{ booking.customer_details.phone }}</td>
						</tr>

						<tr>
							<td class="font-weight-semibold">Start Date:</td>
							<td> {{ booking.start_date | humanDate }}</td>
						</tr>
						<tr>
							<td class="font-weight-semibold">End Date (i.e Today):</td>
							<td> {{ booking.end_date | humanDate }}</td>
						</tr>
						<tr>
							<td class="font-weight-semibold">Price per Night:</td>
							<td> {{ booking.price_per_night | money }}</td>
						</tr>
						<tr>
							<td class="font-weight-semibold">Number of Nights: </td>
							<td> {{ numberOfNights }} </td>
						</tr>
						<tr>
							<td class="font-weight-semibold">Total Charge:</td>
							<td> {{ totalCharge | money }} </td>
						</tr>
						<tr>
							<td class="font-weight-semibold">Amount Paid:</td>
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
					</tbody>
				</table>
			</b-card-body>
			<div class="row text-center">
				<div class="col-12">
					<ManagedStateButton
						:state="closeBookingBtnState"
						mainTitle="Close Booking"
						mainVariant="dark"
						@clicked="closeBooking"
					></ManagedStateButton>
				</div>
			</div>
		</div>

		<CollectPayment
			v-if="booking.price_per_night != null"
			:sellable-id="booking.id"
			sellable-type="booking"
			:sellable="booking"
			:required-amount="totalDue"
			exact-amount-required
			take-credit
			class="col-12 col-lg-5 ml-3"
			@success="paymentSucceessful"
			@error="paymentFailed"
			:state="collectPaymentFormState"
		></CollectPayment>
	</div>
</template>
