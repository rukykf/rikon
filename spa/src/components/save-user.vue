<script>
    import StateButton from "./state-button"
    import SuccessFailureAlert from "./success-failure-alert"
    import Multiselect from 'vue-multiselect'

    export default {
        name: "save-user",
        components: {SuccessFailureAlert, StateButton, Multiselect},
        props: {
            user: {
                type: Object,
                default: function(){
                    return {
                        firstName: null,
                        lastName: null,
                        role: 'receptionist',
                        departments: ['hotel'],
                        username: null,
                        password: null
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
                    title: "Save User",
                    variant: "primary",
                    loading: false,
                    disabled: false,
                    icon: 'none'
                },
                newUserFirstNameValidation: null,
                newUserLastNameValidation: null,
                newUserUsernameValidation: null,
                newUserPasswordValidation: null,
                newUserRoleValidation: null,
                newUserDepartmentsValidation: null,
                newUser: {
                    firstName: this.user.firstName,
                    lastName: this.user.lastName,
                    role: this.user.role,
                    departments: this.user.departments,
                    username: this.user.username,
                    password: this.user.password
                },
                departments: ['all departments', 'hotel', 'kitchen', 'bar'],
                roles: ['point of sales', 'receptionist', 'administrator', 'MD', 'accountant'],
                disabled: false,
                errors: [],
                success: []
            }
        },
        methods: {
            validateAndSubmit: function(){
                if(this.isValid()){
                    this.newDepartmentNameValidation = null
                    this.submitBtn.loading = true
                    setTimeout(() => {
                        this.submitBtn.variant = 'success'
                        this.submitBtn.loading = false
                        this.submitBtn.disabled = true
                        this.submitBtn.icon = 'check'
                        this.submitBtn.title = "Success"
                        this.disabled = true
                        this.$emit('user-saved', this.newUser)
                        this.success.push('Successfully saved')
                        if(this.addMultiple){
                            this.resetForm()
                        }
                    }, 1200)
                }
            },
            isValid: function(){
                if(this.newUser.firstName === null || this.newUser.firstName.length < 1){
                    this.newUserFirstNameValidation = 'First name is required'
                    return false
                }

                if(this.newUser.lastName === null || this.newUser.lastName.length < 1){
                    this.newUserLastNameValidation = 'Last name is required'
                    return false
                }

                if(this.newUser.role === null || this.newUser.role.length < 1){
                    this.newUserRoleValidation = 'A user must have a role'
                    return false
                }

                if(this.newUser.departments.length < 1){
                    this.newUserDepartmentsValidation = 'A user must belong to at least 1 department'
                    return false
                }

                if(this.newUser.username === null || this.newUser.username.length < 1){
                    this.newUserUsernameValidation = 'Username is required for login into the system'
                    return false
                }

                if(this.newUser.password === null || this.newUser.password.length < 1){
                    this.newUserPasswordValidation = 'Password is required for login into the system'
                    return false
                }

                return true
            },
            resetForm: function(){
                this.submitBtn.loading = true
                this.submitBtn.variant = 'primary'
                setTimeout(() => {
                    this.newUser.firstName = null
                    this.newUser.lastName = null
                    this.newUser.role = 'receptionist'
                    this.newUser.departments = ['hotel']
                    this.newUser.username = null
                    this.newUser.password = null
                    this.submitBtn.loading = false
                    this.submitBtn.disabled = false
                    this.submitBtn.icon = 'none'
                    this.submitBtn.title = 'Save Another User'
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
                <label for="userFirstName">
                    <h6>Enter First Name: </h6>
                    <small v-if="newUserFirstNameValidation !== null" class="text-danger">* {{ newUserFirstNameValidation }}</small>
                </label>

                <input type="text" id="userFirstName" name="userFirstName" :disabled="disabled" v-model="newUser.firstName" placeholder=""
                       required
                       class="form-control ">
            </div>

            <div class="form-group">
                <label for="userLastName">
                    <h6>Enter Last Name: </h6>
                    <small v-if="newUserLastNameValidation !== null" class="text-danger">* {{ newUserLastNameValidation }}</small>
                </label>

                <input type="text" id="userLastName" name="userLastName" :disabled="disabled" v-model="newUser.lastName" placeholder=""
                       required
                       class="form-control ">
            </div>

            <div class="form-group">
                <label for="userRole">
                    <h6>Select User Role: </h6>
                    <small v-if="newUserRoleValidation !== null" class="text-danger">* {{ newUserRoleValidation }}</small>
                </label>

                <Multiselect :disabled="disabled" id="userRole" loading="true" :options="roles" v-model="newUser.role"></Multiselect>
            </div>

            <div class="form-group">
                <label for="userDepartments">
                    <h6>Select User Department(s): </h6>
                    <small v-if="newUserDepartmentsValidation !== null" class="text-danger">* {{ newUserDepartmentsValidation }}</small>
                </label>

                <Multiselect :disabled="disabled" id="userDepartments" :multiple="true" :options="departments" v-model="newUser.departments"></Multiselect>
            </div>

            <div class="form-group">
                <label for="username">
                    <h6>Enter username (for login into the system): </h6>
                    <small v-if="newUserUsernameValidation !== null" class="text-danger">* {{ newUserUsernameValidation }}</small>
                </label>

                <input type="text" id="username" name="username" :disabled="disabled" v-model="newUser.username" placeholder=""
                       required
                       class="form-control ">
            </div>

            <div class="form-group">
                <label for="password">
                    <h6>Enter password (for login into the system): </h6>
                    <small v-if="newUserPasswordValidation !== null" class="text-danger">* {{ newUserPasswordValidation }}</small>
                </label>

                <input type="text" id="password" name="password" :disabled="disabled" v-model="newUser.password" placeholder=""
                       required
                       class="form-control ">
            </div>

        </div>

        <p>
            <StateButton :buttonState="submitBtn" @clicked="validateAndSubmit"></StateButton>
        </p>
    </div>

</template>

