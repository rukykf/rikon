<script>
export default {
	name: "collect-credit",
	props: {
		state: {
			type: String,
			default: "initialize", // possible values are ['loading', 'success', 'fail', 'try-again']
		},
		roomNumberRequired: {
			type: Boolean,
			default: false,
		},
		phoneNumberRequired: {
			type: Boolean,
			default: false,
		},
		sellableType: {
			type: String,
			required: true,
		},
		sellableId: {
			type: Number,
			required: true,
		},
	},
	data: function() {
		return {
			name: "",
			phoneNumber: "",
			roomNumber: "",
			nameValidation: null,
			roomNumberValidation: null,
			phoneNumberValidation: null,
		}
	},
	computed: {
		disabled: function() {
			if (this.state === "success" || this.state === "fail") {
				return true
			}
			return false
		},
	},

	watch: {},

	methods: {
		validateAndSubmit: function() {
			if (this.validate()) {
				let creditInfo
				creditInfo = {
					customerName: this.name,
					customerPhone: this.phoneNumber,
					customerRoom: this.roomNumber,
				}
				this.nameValidation = null
				this.roomNumberValidation = null
				this.phoneNumberValidation = null
				this.$emit("clicked", creditInfo)
			}
		},
		validate: function() {
			// name is always required
			if (this.name.length < 1) {
				this.nameValidation = "The customer's name is required"
				return false
			}

			if (this.roomNumberRequired && (this.roomNumber < 100 || this.roomNumber > 400)) {
				this.roomNumberValidation = "Enter a valid room number between 100 and 320"
				return false
			}

			if (this.phoneNumberRequired && this.phoneNumber.length !== 11) {
				this.phoneNumberValidation = "Enter a valid 11 digit phone number"
				return false
			}
			return true
		},
	},
}
</script>

<template>
	<div class="row text-left mt-3 ">
		<div class="col-12 payment-form pt-4 mt-2 mx-auto">
			<div class="card ">
				<div class="card-body">
					<div class="pt-3">
						<div class="form-group">
							<label for="name">
								<h6>Enter Customer Name: </h6>
								<small v-if="nameValidation !== null" class="text-danger">* {{ nameValidation }}</small>
							</label>

							<input
								type="text"
								id="name"
								name="text"
								:disabled="disabled"
								v-model="name"
								placeholder=""
								required
								class="form-control "
							/>
						</div>

						<div class="form-group">
							<label for="roomNumber">
								<h6>Enter Room Number: </h6>
								<small v-if="roomNumberValidation !== null" class="text-danger">* {{ roomNumberValidation }}</small>
							</label>

							<input
								type="number"
								id="roomNumber"
								name="number"
								:disabled="disabled"
								v-model.number="roomNumber"
								placeholder="e.g 103"
								class="form-control "
							/>
						</div>

						<div class="form-group">
							<label for="phoneNumber">
								<h6>Enter Customer Phone Number: </h6>
								<small v-if="phoneNumberValidation !== null" class="text-danger">* {{ phoneNumberValidation }}</small>
							</label>

							<input
								type="text"
								id="phoneNumber"
								name="text"
								:disabled="disabled"
								v-model="phoneNumber"
								placeholder="e.g 08123456789"
								class="form-control "
							/>
						</div>
					</div>

					<p>
						<button class="btn btn-primary" v-if="state === 'loading'">
							<b-spinner variant="white" class="mx-5"></b-spinner>
						</button>
						<button class="btn btn-success" disabled v-else-if="state === 'success'">
							<i class="uil-check mr-2"></i> Successful
						</button>
						<button class="btn btn-danger" disabled v-else-if="state === 'fail'">
							<i class=" uil-times mr-2"></i> Failed to save
						</button>
						<button class="btn btn-danger" @click.stop.prevent="validateAndSubmit" v-else-if="state === 'try-again'">
							<i class="uil-refresh mr-2"></i> Saving failed, try again
						</button>
						<button
							v-else
							type="button"
							:disabled="disabled"
							@click.stop.prevent="validateAndSubmit"
							class="btn btn-primary px-4"
						>
							Submit
						</button>
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.payment-form {
	background: #f5f5f5;
}

.rounded {
	border-radius: 1rem;
}

.nav-pills .nav-link {
	color: #555;
}

.nav-pills .nav-link.active {
	color: white;
}

input[type="radio"] {
	margin-right: 5px;
}

.bold {
	font-weight: bold;
}
</style>
