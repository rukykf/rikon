<script>
export default {
	name: "collect-cash-payment",
	props: {
		state: {
			type: String,
			default: "initialize", // possible values are ['loading', 'success', 'fail', 'try-again', 'add-another-payment']
		},
		requiredAmount: {
			type: Number,
			default: 1000.0,
		},
		exactAmountRequired: {
			type: Boolean,
			default: false,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	data: function() {
		return {
			amount: this.requiredAmount,
			paymentMethod: "cash",
			amountValidation: null,
		}
	},

	watch: {},

	methods: {
		validateAndSubmit: function() {
			if (this.validate()) {
				let paymentInfo = {
					paymentMethod: this.paymentMethod,
					amount: this.amount,
				}
				this.amountValidation = null
				this.$emit("clicked", paymentInfo)
			}
		},
		validate: function() {
			if (this.exactAmountRequired && this.amount !== this.requiredAmount) {
				this.amountValidation = "Customer should pay: " + this.requiredAmount
				return false
			}

			if (this.amount < 1 || this.amount > this.requiredAmount) {
				this.amountValidation = "Amount should be less than or equal to: " + this.requiredAmount
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
						<div class="form-group ">
							<h6 class="pb-2">Select payment method</h6>
							<label class="radio-inline">
								<input type="radio" name="optradio" :disabled="disabled" value="cash" v-model="paymentMethod" checked /> Cash
							</label>
							<label class="radio-inline">
								<input
									type="radio"
									name="optradio"
									:disabled="disabled"
									value="transfer"
									v-model="paymentMethod"
									class="ml-5"
								/>Transfer
							</label>
							<label class="radio-inline">
								<input type="radio" name="optradio" :disabled="disabled" value="POS" v-model="paymentMethod" class="ml-5" />POS
							</label>
						</div>

						<div class="form-group">
							<label for="amount">
								<h6>Enter Amount (Naira): </h6>
								<small v-if="amountValidation !== null" class="text-danger">* {{ amountValidation }}</small>
							</label>

							<input
								type="number"
								id="amount"
								name="amount"
								:disabled="disabled"
								v-model.number="amount"
								placeholder="0.00"
								required
								class="form-control "
							/>
						</div>
					</div>

					<p>
						<button class="btn btn-primary" v-if="state === 'loading'">
							<b-spinner variant="white" class="mx-5"></b-spinner>
						</button>
						<button class="btn btn-success" disabled v-else-if="state === 'success'">
							<i class="uil-check mr-2"></i> Payment Success
						</button>
						<button
							class="btn btn-success"
							@click.stop.prevent="validateAndSubmit"
							v-else-if="state === 'add-another-payment'"
						>
							<i class="uil-refresh mr-2"></i> Add Another Payment
						</button>
						<button class="btn btn-danger" disabled v-else-if="state === 'fail'">
							<i class="uil-times mr-2"></i> Payment Failed
						</button>
						<button class="btn btn-danger" @click.stop.prevent="validateAndSubmit" v-else-if="state === 'try-again'">
							<i class="uil-refresh mr-2"></i> Try Again
						</button>
						<button
							v-else
							type="button"
							:disabled="disabled"
							@click.stop.prevent="validateAndSubmit"
							class="btn btn-primary px-4"
						>
							<i class="uil-atm-card mr-2"></i> Add Payment
						</button>
						{{ amount }}
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
