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
		sellable: {
			type: Object,
			required: true,
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
	computed: {
		disabled: function() {
			if (this.state === "success" || this.state === "fail") {
				return true
			}
			return false
		},
	},
	methods: {
		paymentSuccessful: function(updatedSaleInfo) {
			this.$emit("success", updatedSaleInfo)
		},
		paymentFailed: function(paymentInfo) {
			this.$emit("error")
		},
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
						<b class="font-weight-bold">Debt</b>
					</b-form-checkbox>
				</div>

				<div v-if="creditForm">
					<CollectCredit
						:state="state"
						v-if="sellableType === 'booking'"
						:room-number-required="roomNumberRequired"
						:phone-number-required="phoneNumberRequired"
						:sellable-type="sellableType"
						:sellable-id="sellableId"
						:customer-name="sellable.customer_details.name"
						:customer-phone="sellable.customer_details.phone"
						@success="paymentSuccessful"
						@error="paymentFailed"
					></CollectCredit>

					<CollectCredit
						:state="state"
						v-else-if="sellableType === 'order'"
						:room-number-required="roomNumberRequired"
						:phone-number-required="phoneNumberRequired"
						:sellable-type="sellableType"
						:sellable-id="sellableId"
						@success="paymentSuccessful"
						@error="paymentFailed"
					></CollectCredit>
				</div>

				<div v-else>
					<CollectCashPayment
						:sellable-id="sellableId"
						:sellable-type="sellableType"
						:required-amount="requiredAmount"
						exact-amount-required
						:state="state"
						@success="paymentSuccessful"
						@error="paymentFailed"
					></CollectCashPayment>
				</div>
			</div>
		</div>
	</div>
</template>
