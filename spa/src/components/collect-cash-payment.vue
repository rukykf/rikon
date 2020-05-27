<script>
import SuccessFailureAlert from "./success-failure-alert"
import ManagedStateButton from "./managed-state-button"
export default {
	name: "collect-cash-payment",
	components: { ManagedStateButton, SuccessFailureAlert },
	props: {
		state: {
			type: String,
			default: "initialize", // possible values are ['loading', 'success', 'fail', 'try-again', 'add-another-payment']
		},
		requiredAmount: {
			type: Number,
			default: 200.0,
		},
		sellableType: {
			type: String,
			required: true,
		},
		sellableId: {
			type: Number,
			required: true,
		},
		exactAmountRequired: {
			type: Boolean,
			default: false,
		},
	},
	data: function() {
		return {
			amount: this.requiredAmount,
			paymentMethod: null,
			amountValidation: null,
			paymentMethodValidation: null,
			errors: [],
			success: [],
			paymentBtnState: this.state,
		}
	},
	computed: {
		disabled: function() {
			if (this.state === "success" || this.state === "fail") {
				return true
			}
			return false
		},
		computedPaymentBtnState: function() {
			return this.paymentBtnState
		},
	},

	watch: {},

	methods: {
		validateAndPay: function() {
			if (!this.validate()) {
				return
			}

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

			if (this.paymentMethod === null) {
				this.paymentMethodValidation = "Select a valid payment method"
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
					<SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
					<div class="pt-3">
						<div class="form-group ">
							<small v-if="paymentMethodValidation !== null" class="text-danger">* {{ paymentMethodValidation }}</small>
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
						<ManagedStateButton
							:state="computedPaymentBtnState"
							main-title="Add Payment"
							main-variant="primary"
							feather-icon="credit-card"
							@clicked="validateAndPay"
						></ManagedStateButton>
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
