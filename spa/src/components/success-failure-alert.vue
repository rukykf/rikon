<script>
export default {
	name: "success-failure-alert",
	props: {
		errors: {
			type: Array,
			default: function() {
				return []
			},
		},
		success: {
			type: Array,
			default: function() {
				return []
			},
		},
		warnings: {
			type: Array,
			default: function() {
				return []
			},
		},
	},
}
</script>

<template>
	<div class="mt-3">
		<b-alert v-for="error in errors" :key="error" variant="danger" show="20" dismissible>
			<feather type="alert-triangle" class="align-middle mr-1"></feather>
			<span class="align-middle">{{ error }}</span>
		</b-alert>

		<b-alert v-for="message in success" :key="message" variant="success" show="10" dismissible>
			<feather type="check" class="align-middle mr-1"></feather>
			<span class="align-middle">{{ message }}</span>
		</b-alert>

		<b-alert v-for="warning in warnings" :key="warning" variant="warning" show="20" dismissible>
			<feather type="alert-triangle" class="align-middle mr-1"></feather>
			<span class="align-middle">{{ warning }}</span>
		</b-alert>
	</div>
</template>
