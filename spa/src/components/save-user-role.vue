<script>
    import StateButton from "./state-button";
    import SuccessFailureAlert from "./success-failure-alert";
    import Multiselect from 'vue-multiselect'

    export default {
        name: "save-user-role",
        components: {SuccessFailureAlert, StateButton, Multiselect},
        props: {
            role: {
                type: Object,
                default: function(){
                    return {
                        name: null,
                        permissions: []
                    }
                }
            },
            addMultiple: {
                type: Boolean,
                default: false
            }
        },
        data: function(){
            return {
                submitBtn: {
                    title: "Save Role",
                    variant: "primary",
                    loading: false,
                    disabled: false,
                    icon: 'none'
                },
                newRoleNameValidation: null,
                newRolePermissionsValidation: null,
                newRole: {
                    name: this.role.name,
                    permissions: this.role.permissions
                },
                disabled: false,
                permissions: ['can-view-forms', 'can-view-reports', 'pos', 'hotel-booking'],
                errors: [],
                success: []
            }
        },
        methods: {
            validateAndSubmit: function(){
                if(this.isValid()){
                    this.newRoleNameValidation = null
                    this.newRolePermissionsValidation = null
                    this.submitBtn.loading = true
                    setTimeout(() => {
                        this.submitBtn.variant = 'success'
                        this.submitBtn.loading = false
                        this.submitBtn.disabled = true
                        this.submitBtn.icon = 'check'
                        this.submitBtn.title = "Success"
                        this.disabled = true
                        this.$emit('user-role-saved', this.newRole)
                        this.success.push('Successfully saved')
                        if(this.addMultiple){
                            this.resetForm()
                        }
                    }, 1200)
                }
            },
            isValid: function(){
                if(this.newRole.name === null || this.newRole.name.length < 1){
                    this.newRoleNameValidation = 'Role name is required'
                    return false
                }

                if(this.newRole.permissions.length < 1){
                    this.newRolePermissionsValidation = 'A role must have at least 1 permission'
                    return false
                }

                return true
            },
            resetForm: function(){
                this.submitBtn.loading = true
                this.submitBtn.variant = 'primary'
                setTimeout(() => {
                    this.newRole.name = null
                    this.newRole.permissions = []
                    this.submitBtn.loading = false
                    this.submitBtn.disabled = false
                    this.submitBtn.icon = 'none'
                    this.submitBtn.title = 'Save Another Role'
                    this.disabled = false
                }, 500)

            }
        }
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

                <input type="text" id="roleName" name="roleName" :disabled="disabled" v-model="newRole.name" placeholder=""
                       required
                       class="form-control ">
            </div>
            <div class="form-group">
                <label for="rolePermissions">
                    <h6>Select Permissions </h6>
                    <small v-if="newRolePermissionsValidation !== null" class="text-danger">* {{ newRolePermissionsValidation }}</small>
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
            <StateButton :buttonState="submitBtn" @clicked="validateAndSubmit"></StateButton>
        </p>
    </div>

</template>

<style scoped>
    .store-item-form {
        background: #f5f5f5
    }

    .rounded {
        border-radius: 1rem
    }

    .nav-pills .nav-link {
        color: #555
    }

    .nav-pills .nav-link.active {
        color: white
    }

    input[type="radio"] {
        margin-right: 5px
    }

    .bold {
        font-weight: bold
    }
</style>