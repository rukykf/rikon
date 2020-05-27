<script>
import SuccessFailureAlert from "./success-failure-alert"
import ManagedStateButton from "./managed-state-button"
import ErrorHandler from "@src/ErrorHandler"

export default {
	name: "save-room-type",
	components: { ManagedStateButton, SuccessFailureAlert },
	props: {
		roomType: {
			type: Object,
			default: function() {
				return {
					id: null,
					name: null,
					price_per_night: null,
				}
			},
		},
		addMultiple: {
			type: Boolean,
			default: false,
		},
	},
	data: function() {
		return {
			submitBtnState: "initialize",
			newRoomTypeNameValidation: null,
			newRoomTypePricePerNightValidation: null,
			newRoomType: {
				name: this.roomType.name,
				price_per_night: this.roomType.price_per_night,
			},
			disabled: false,
			errors: [],
			success: [],
		}
	},
	methods: {
		validateAndSubmit: async function() {
			if (this.isValid()) {
				try {
					this.submitBtnState = "loading"
					let url = "api/room-types/"

					if (this.roomType.id != null) {
						url += this.roomType.id
					}

					await this.$httpClient.post(url, this.newRoomType)
					this.success.push(`Successfully saved Room Type: ${this.newRoomType.name}`)
					if (this.addMultiple) {
						this.submitBtnState = "success-try-again"
						this.resetForm()
					} else {
						this.disabled = true
						this.submitBtnState = "success"
					}
				} catch (error) {
					this.submitBtnState = "fail-try-again"
					let errors = ErrorHandler(error)
					this.errors.push(...errors)
				}
			}
		},
		isValid: function() {
			if (this.newRoomType.name === null || this.newRoomType.name.length < 1) {
				this.newRoomTypeNameValidation = "Name is required"
				return false
			}

			if (this.newRoomType.price_per_night < 1000) {
				this.newRoomTypePricePerNightValidation = "Enter a valid amount in naira that is at least N1,000"
				return false
			}

			return true
		},
		resetForm: function() {
			this.newRoomType.name = null
			this.newRoomType.price_per_night = null
			this.newRoomTypePricePerNightValidation = null
			this.newRoomTypeNameValidation = null
		},
	},
}
</script>

<template>
	<div>
		<SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
		<div class="pt-3">
			<div class="form-group">
				<label for="roomTypeName">
					<h6>Enter Name of Room Type: </h6>
					<small v-if="newRoomTypeNameValidation !== null" class="text-danger">* {{ newRoomTypeNameValidation }}</small>
				</label>

				<input
					type="text"
					id="roomTypeName"
					name="roomTypeName"
					:disabled="disabled"
					v-model="newRoomType.name"
					placeholder="e.g Deluxe"
					class="form-control "
				/>
			</div>

			<div class="form-group">
				<label for="roomTypePricePerNight">
					<h6>Enter Price per Night (Naira): </h6>
					<small v-if="newRoomTypePricePerNightValidation !== null" class="text-danger"
						>* {{ newRoomTypePricePerNightValidation }}</small
					>
				</label>

				<input
					type="number"
					id="roomTypePricePerNight"
					name="roomTypePricePerNight"
					:disabled="disabled"
					v-model.number="newRoomType.price_per_night"
					placeholder=""
					class="form-control "
				/>
			</div>
		</div>

		<p>
			<ManagedStateButton
				main-title="Save Room Type"
				success-try-again-title="Save Another Department"
				:state="submitBtnState"
				@clicked="validateAndSubmit"
			></ManagedStateButton>
		</p>
	</div>
</template>
