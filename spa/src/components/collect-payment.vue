<script>
import CollectCredit from "./collect-credit"
import CollectCashPayment from "./collect-cash-payment"
export default {
	name: "collect-payment",
	components: { CollectCashPayment, CollectCredit },
	props: {
		takeCredit: {
			type: Boolean,
			default: false,
		},
		state: {
			type: String,
			default: "initialize", // possible values are ['loading', 'success', 'fail', 'try-again', 'add-another-payment'] Note that add-another-payment is only valid for cash payments
		},
		sellableType: {
			type: String,
			required: true,
		},
		sellableId: {
			type: Number,
			required: true,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		requiredAmount: {
			type: Number,
			default: 200.0,
		},
		exactAmountRequired: {
			type: Boolean,
			default: false,
		},
		roomNumberRequired: {
			type: Boolean,
			default: false,
		},
		phoneNumberRequired: {
			type: Boolean,
			default: false,
		},
	},
	data: function() {
		return {
			creditForm: false,
		}
	},
	computed: {},
	methods: {
		paymentSuccessful: function(paymentInfo) {},
		paymentFailed: function(paymentInfo) {},
	},
}
</script>

<template>
	<div>
		<div>
			<h4>Add Payment</h4>
			<div>
				<div class="form-inline" v-if="takeCredit">
					<b class="mr-2 font-weight-bold">Cash</b>
					<b-form-checkbox :disabled="disabled" v-model="creditForm" name="check-button" switch>
						<b class="font-weight-bold">Credit</b>
					</b-form-checkbox>
				</div>

				<CollectCredit
					:state="state"
					v-if="creditForm"
					@clicked="collectCreditPayment"
					:room-number-required="roomNumberRequired"
					:phone-number-required="phoneNumberRequired"
					:sellable-type="sellableType"
					:sellable-id="sellableId"
					@payment-successful="paymentSuccessful"
					@payment-failed="paymentFailed"
				></CollectCredit>
				<CollectCashPayment
					:sellable-id="sellableId"
					:sellable-type="sellableType"
					:required-amount="requiredAmount"
					:exact-amount-required="exactAmountRequired"
					:state="state"
					v-else
					@payment-successful="paymentSuccessful"
					@payment-failed="paymentFailed"
				></CollectCashPayment>
			</div>
		</div>
	</div>
</template>
