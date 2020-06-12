<script>
import FormBackground from "@components/form-background"
import SuccessFailureAlert from "../../../../../components/success-failure-alert"
import CollectPayment from "../../../../../components/collect-payment"
import ErrorHandler from "../../../../../ErrorHandler"

export default {
	name: "fulfill-order",
	components: { FormBackground, SuccessFailureAlert, CollectPayment },
	props: {
		order: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			errors: [],
			success: [],
			loading: false,
			collectPaymentFormState: "initialize",
		}
	},

	computed: {
		requiredAmount() {
			if (this.order.sale != null) {
				return this.order.sale.total_due
			} else {
				return this.order.amount
			}
		},
	},

	methods: {
		async validateAndFulfill(updatedSaleRecord) {
			if (this.isOrderFulfillmentValid(updatedSaleRecord)) {
				try {
					let url = `api/orders/${this.order.id}`
					this.loading = true
					await this.$httpClient.patch(url, {
						status: "fulfilled",
						cancellation_remarks: this.order.cancellation_remarks,
						delivered_by: this.order.delivered_by,
					})
					this.success.push("Successfully Fulfilled Order")
					this.loading = false
					this.disabled = true
					this.collectPaymentFormState = "success"
				} catch (error) {
					this.loading = false
					let errors = ErrorHandler(error)
					this.errors.push(...errors)
				}
			}
		},

		isOrderFulfillmentValid(saleRecord) {
			if (saleRecord.total_due === 0 || saleRecord.customer_details.name != null) {
				return true
			}

			this.errors.push("You cannot fulfill this order without making full payment or recording a debt")
			return false
		},
	},
}
</script>

<template>
	<FormBackground>
		<SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
		<div class="text-center" v-if="loading">
			<b-spinner size="lg" class="p-5"></b-spinner>
		</div>
		<CollectPayment
			v-else
			:state="collectPaymentFormState"
			sellable-type="order"
			:sellable-id="order.id"
			:sellable="order"
			:required-amount="requiredAmount"
			take-credit
			@success="validateAndFulfill"
		></CollectPayment>
	</FormBackground>
</template>

<style scoped></style>
