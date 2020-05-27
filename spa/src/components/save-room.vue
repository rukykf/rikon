<script>
import SuccessFailureAlert from "./success-failure-alert"
import Multiselect from "vue-multiselect"
import ManagedStateButton from "./managed-state-button"
import ErrorHandler from "@src/ErrorHandler"

export default {
	name: "save-room",
	components: { ManagedStateButton, SuccessFailureAlert, Multiselect },
	props: {
		room: {
			type: Object,
			default: function() {
				return {
					id: null,
					room_no: null,
					room_type: null,
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
			submitBtn: {
				title: "Save Room",
				variant: "primary",
				loading: false,
				disabled: false,
				icon: "none",
			},
			newRoomNumberValidation: null,
			newRoomTypeValidation: null,
			roomTypes: [],
			newRoom: {
				room_no: this.room.room_no,
				room_type: this.room.room_type,
			},
			disabled: false,
			errors: [],
			success: [],
		}
	},
	mounted: function() {
		this.getRoomTypesData()
	},
	methods: {
		getRoomTypesData: async function() {
			try {
				let response = await this.$httpClient.get("api/room-types")
				this.roomTypes = response.data
			} catch (error) {
				let errors = ErrorHandler(error)
				this.errors.push(...errors)
			}
		},
		validateAndSubmit: async function() {
			if (this.isValid()) {
				this.newRoom.room_type_id = this.newRoom.room_type.id

				try {
					this.submitBtnState = "loading"
					let url = "api/rooms/"

					if (this.room.id != null) {
						url += this.room.id
					}

					await this.$httpClient.post(url, this.newRoom)
					this.success.push(`Successfully saved room: ${this.newRoom.room_no}`)
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
			if (this.newRoom.room_no < 100 || this.newRoom.room_no > 350) {
				this.newRoomNumberValidation = "Enter a valid room number between 100 and 350"
				return false
			}

			if (this.newRoom.room_type == null) {
				this.newRoomTypeValidation = "Please select a valid room type"
				return false
			}

			return true
		},
		resetForm: function() {
			this.newRoom.room_no = null
			this.newRoom.room_type = null
			this.newRoomNumberValidation = null
			this.newRoomTypeValidation = null
		},
	},
}
</script>

<template>
	<div>
		<SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
		<div class="pt-3">
			<div class="form-group">
				<label for="roomNumber">
					<h6>Enter Room Number: </h6>
					<small v-if="newRoomNumberValidation !== null" class="text-danger">* {{ newRoomNumberValidation }}</small>
				</label>

				<input
					type="number"
					id="roomNumber"
					name="roomNumber"
					:disabled="disabled"
					v-model.number="newRoom.room_no"
					placeholder="e.g 103"
					class="form-control "
				/>
			</div>

			<div class="form-group">
				<label for="roomType">
					<h6>Select the type of room</h6>
					<small v-if="newRoomTypeValidation !== null" class="text-danger">* {{ newRoomTypeValidation }}</small>
				</label>

				<Multiselect
					id="roomType"
					v-model="newRoom.room_type"
					:disabled="disabled"
					:options="roomTypes"
					track-by="id"
					label="name"
				>
				</Multiselect>
			</div>
		</div>

		<p>
			<ManagedStateButton
				main-title="Save Room"
				success-try-again-title="Save Another Room"
				:state="submitBtnState"
				@clicked="validateAndSubmit"
			></ManagedStateButton>
		</p>
	</div>
</template>
