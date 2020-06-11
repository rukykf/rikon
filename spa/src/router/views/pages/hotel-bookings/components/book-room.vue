<script>
import ManagedStateButton from "../../../../../components/managed-state-button"
import CollectCashPayment from "@src/components/collect-cash-payment"
import SuccessFailureAlert from "../../../../../components/success-failure-alert"
import _ from "lodash"

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
			editCustomerDetailsBtnState: "initialize",
			booking: null,
			bookingForm: {
				name: "",
				phone: "",
			},
			guestNameValidation: null,
			guestPhoneValidation: null,
			collectCashPaymentState: "initialize",
			success: [],
			errors: [],
		}
	},
	methods: {
		bookRoom: async function() {
			if (!this.isBookingFormValid()) {
				return
			}

			try {
				this.bookRoomBtnState = "loading"
				let url = `api/hotel-rooms/${this.room.room.id}/bookings`
				let response = await this.$httpClient.post(url, {
					customer_details: this.bookingForm,
				})
				this.booking = response.data
				this.bookRoomBtnState = "success"
				this.success.push("Successfully Booked Room ".concat(this.room.room.room_no))
				this.$emit("room-is-booked")
			} catch (error) {
				console.log(error)
				if (_.get(error, ["response", "data", "messages"])) {
					this.errors = error.response.data.messages
				} else {
					this.errors = ["Network error, contact management to resolve the issue"]
				}
				this.bookRoomBtnState = "fail-try-again"
			}
		},
		editCustomerDetails: async function() {
			if (!this.isBookingFormValid()) {
				return
			}

			try {
				this.editCustomerDetailsBtnState = "loading"
				let url = `api/bookings/${this.booking.id}`
				let response = await this.$httpClient.patch(url, {
					customer_details: this.bookingForm,
				})
				this.booking = response.data
				this.editCustomerDetailsBtnState = "initialize"
				this.success.push("Successfully Edited Customer Details")
				this.$emit("room-booking-is-edited")
			} catch (error) {
				if (_.get(error, ["response", "data", "messages"])) {
					this.errors = error.response.data.messages
				} else {
					this.errors = ["Network error, contact management to resolve the issue"]
				}
				this.editCustomerDetailsBtnState = "fail-try-again"
			}
		},

		collectPayment: function(paymentDetails) {
			this.collectCashPaymentState = "loading"
			setTimeout(() => {
				this.collectCashPaymentState = "success"
			}, 800)
		},
		isBookingFormValid() {
			if (this.bookingForm.name.length < 1) {
				this.guestNameValidation = "The name of the guest is required"
			} else {
				this.guestNameValidation = null
			}

			if (this.bookingForm.phone.length !== 11) {
				this.guestPhoneValidation = "The phone number of the guest is required and should be at least 11 characters long"
			} else {
				this.guestPhoneValidation = null
			}

			if (this.guestPhoneValidation !== null || this.guestNameValidation !== null) {
				return false
			} else {
				return true
			}
		},
	},
}
</script>

<template>
	<div>
		<SuccessFailureAlert :success="success" :errors="errors"></SuccessFailureAlert>

		<div class="pt-3" v-if="booking === null">
			<div class="form-group">
				<label for="guestName">
					<h6>Enter Guest Name: </h6>
					<small v-if="guestNameValidation !== null" class="text-danger">* {{ guestNameValidation }}</small>
				</label>

				<input
					type="text"
					id="guestName"
					name="guestName"
					v-model="bookingForm.name"
					placeholder=""
					required
					class="form-control"
				/>
			</div>

			<div class="form-group">
				<label for="guestName">
					<h6>Enter Guest Phone Number: </h6>
					<small v-if="guestPhoneValidation !== null" class="text-danger">* {{ guestPhoneValidation }}</small>
				</label>

				<input
					type="text"
					id="guestPhone"
					name="guestPhone"
					v-model="bookingForm.phone"
					placeholder=""
					required
					class="form-control "
				/>
			</div>

			<ManagedStateButton
				:state="bookRoomBtnState"
				mainTitle="Book Room"
				@clicked="bookRoom"
				mainVariant="dark"
			></ManagedStateButton>
		</div>

		<div class="text-center">
			<div v-if="booking !== null" class="row">
				<div class="col-12 col-lg-6 mt-4">
					<div class="text-left mt-1 mb-4">
						<h5>Edit Customer Details</h5>
						<div class="form-group">
							<label for="editGuestName">
								<h6>Enter Guest Name: </h6>
								<small v-if="guestNameValidation !== null" class="text-danger">* {{ guestNameValidation }}</small>
							</label>

							<input
								type="text"
								id="editGuestName"
								name="guestName"
								v-model="bookingForm.name"
								placeholder=""
								required
								class="form-control"
							/>
						</div>

						<div class="form-group">
							<label for="editGuestPhone">
								<h6>Enter Guest Phone Number: </h6>
								<small v-if="guestPhoneValidation !== null" class="text-danger">* {{ guestPhoneValidation }}</small>
							</label>

							<input
								type="text"
								id="editGuestPhone"
								name="guestPhone"
								v-model="bookingForm.phone"
								placeholder=""
								required
								class="form-control "
							/>
						</div>

						<ManagedStateButton
							:state="editCustomerDetailsBtnState"
							mainTitle="Edit Customer Details"
							@clicked="editCustomerDetails"
							mainVariant="dark"
						></ManagedStateButton>
					</div>
					<b-card-header>
						Booking Details
					</b-card-header>
					<b-card-body class="text-left">
						<table class="table table-responsive table-hover">
							<tbody>
								<tr>
									<td class="font-weight-semibold">Start Date:</td>
									<td> {{ booking.start_date | humanDate }}</td>
								</tr>
								<tr>
									<td class="font-weight-semibold">Booking Time:</td>
									<td> {{ booking.created_at | humanTime }}</td>
								</tr>
								<tr>
									<td class="font-weight-semibold">Price per Night:</td>
									<td> {{ booking.price_per_night | money }}</td>
								</tr>
								<tr>
									<td class="font-weight-semibold">Room Details:</td>
									<td> {{ room.room.room_type.name.toUpperCase() }} {{ room.room.room_no }}</td>
								</tr>
								<tr>
									<td class="font-weight-semibold">Customer Name:</td>
									<td>{{ booking.customer_details.name }}</td>
								</tr>
								<tr>
									<td class="font-weight-semibold">Customer Phone:</td>
									<td> {{ booking.customer_details.phone }}</td>
								</tr>
							</tbody>
						</table>
					</b-card-body>
				</div>
				<CollectCashPayment
					:state="collectCashPaymentState"
					class="col-12 col-lg-6"
					:required-amount="booking.amount_due"
					@clicked="collectPayment"
					sellable-type="booking"
					:sellableId="booking.id"
				></CollectCashPayment>
			</div>
		</div>
	</div>
</template>
