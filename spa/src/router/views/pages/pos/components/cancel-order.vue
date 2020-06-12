<script>
import FormBackground from "../../../../../components/form-background"
import SuccessFailureAlert from "../../../../../components/success-failure-alert"
import ManagedStateButton from "../../../../../components/managed-state-button"
import ErrorHandler from "../../../../../ErrorHandler"
export default {
	name: "cancel-order",
	components: { ManagedStateButton, SuccessFailureAlert, FormBackground },
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
			disabled: false,
			reasonForCancellation: null,
			reasonForCancellationValidation: null,
			submitBtnState: "initialize",
		}
	},

	methods: {
		async validateAndSubmit() {
			if (this.isCancelOrderFormValid()) {
				try {
					this.submitBtnState = "loading"
					let url = `api/orders/${this.order.id}`
					await this.$httpClient.patch(url, {
						status: "cancelled",
						cancellation_remarks: this.reasonForCancellation,
						delivered_by: this.order.delivered_by,
					})
					this.success.push("Successfully Cancelled Order")
					this.reasonForCancellationValidation = null
					this.disabled = true
					this.submitBtnState = "success"
				} catch (error) {
					this.submitBtnState = "fail-try-again"
					let errors = ErrorHandler(error)
					this.errors.push(...errors)
				}
			}
		},

		isCancelOrderFormValid() {
			if (this.reasonForCancellation === null) {
				this.reasonForCancellationValidation = "You must select a reason for cancelling this order"
				return false
			}

			return true
		},
	},
}
</script>

<template>
	<FormBackground>
		<SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
		<div class="form-group ">
			<small v-if="reasonForCancellationValidation !== null" class="text-danger"
				>* {{ reasonForCancellationValidation }}</small
			>
			<h6 class="pb-2">Select Reason For Cancellation:</h6>
			<label class="radio-inline">
				<input
					type="radio"
					name="optradio"
					:disabled="disabled"
					value="Service Delay"
					v-model="reasonForCancellation"
					checked
				/>
				Service Delay
			</label>
			<label class="radio-inline">
				<input
					type="radio"
					name="optradio"
					:disabled="disabled"
					value="Mistake in Order"
					v-model="reasonForCancellation"
					class="ml-5"
				/>Mistake in Order
			</label>
			<label class="radio-inline">
				<input
					type="radio"
					name="optradio"
					:disabled="disabled"
					value="Other"
					v-model="reasonForCancellation"
					class="ml-5"
				/>Other
			</label>
		</div>
		<p>
			<ManagedStateButton main-title="Submit" :state="submitBtnState" @clicked="validateAndSubmit"></ManagedStateButton>
		</p>
	</FormBackground>
</template>

<style scoped></style>
