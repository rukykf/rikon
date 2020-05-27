<script>
import SuccessFailureAlert from "./success-failure-alert"
import Multiselect from "vue-multiselect"
import ManagedStateButton from "./managed-state-button"
import ErrorHandler from "../ErrorHandler"

export default {
	name: "save-user-role",
	components: { ManagedStateButton, SuccessFailureAlert, Multiselect },
	props: {
		role: {
			type: Object,
			default: function() {
				return {
					id: null,
					name: null,
					permissions: [],
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
			newRoleNameValidation: null,
			newRolePermissionsValidation: null,
			newRole: {
				id: this.role.id,
				name: this.role.name,
				permissions: this.role.permissions,
			},
			disabled: false,
			permissions: [],
			errors: [],
			success: [],
		}
	},

	mounted: function() {
		this.getPermissions()
	},

	methods: {
		getPermissions: async function() {
			try {
				let response = await this.$httpClient.get("api/permissions")
				this.permissions = response.data
			} catch (error) {
				let errors = ErrorHandler(error)
				this.errors.push(...errors)
			}
		},

		validateAndSubmit: async function() {
			if (this.isValid()) {
				try {
					this.submitBtnState = "loading"
					let url = "api/roles/"

					if (this.role.id !== null) {
						url += this.role.id
					}

					await this.$httpClient.post(url, this.newRole)
					this.success.push(`Successfully saved role: ${this.newRole.name}`)
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
			if (this.newRole.name === null || this.newRole.name.length < 1) {
				this.newRoleNameValidation = "Role name is required"
				return false
			}

			if (this.newRole.permissions.length < 1) {
				this.newRolePermissionsValidation = "A role must have at least 1 permission"
				return false
			}

			return true
		},
		resetForm: function() {
			this.newRoleNameValidation = null
			this.newRolePermissionsValidation = null
			this.newRole.name = null
			this.newRole.permissions = []
		},
	},
}
</script>

<template>
	<div>
		<SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
		<div class="pt-3">
			<div class="form-group">
				<label for="roleName">
					<h6>Enter Role Name: </h6>
					<small v-if="newRoleNameValidation !== null" class="text-danger">* {{ newRoleNameValidation }}</small>
				</label>

				<input
					type="text"
					id="roleName"
					name="roleName"
					:disabled="disabled"
					v-model="newRole.name"
					placeholder=""
					required
					class="form-control "
				/>
			</div>
			<div class="form-group">
				<label for="rolePermissions">
					<h6>Select Permissions </h6>
					<small v-if="newRolePermissionsValidation !== null" class="text-danger"
						>* {{ newRolePermissionsValidation }}</small
					>
				</label>
				<multiselect
					v-model="newRole.permissions"
					:options="permissions"
					:multiple="true"
					:disabled="disabled"
					id="rolePermissions"
				></multiselect>
			</div>
		</div>

		<p>
			<ManagedStateButton
				mainTitle="Save Role"
				successTryAgainTitle="Save Another Role"
				:state="submitBtnState"
				@clicked="validateAndSubmit"
			></ManagedStateButton>
		</p>
	</div>
</template>
