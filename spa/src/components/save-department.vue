<script>
    import StateButton from "./state-button";
    import SuccessFailureAlert from "./success-failure-alert";

    export default {
        name: "save-department",
        components: {SuccessFailureAlert, StateButton},
        props: {
            department: {
                type: Object,
                default: function(){
                    return {
                        name: null
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
                    title: "Save Department",
                    variant: "primary",
                    loading: false,
                    disabled: false,
                    icon: 'none'
                },
                newDepartmentNameValidation: null,
                newDepartment: {
                    name: this.department.name
                },
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
                        this.$emit('department-saved', this.newDepartment)
                        this.success.push('Successfully saved')
                        if(this.addMultiple){
                            this.resetForm()
                        }
                    }, 1200)
                }
            },
            isValid: function(){
                if(this.newDepartment.name === null || this.newDepartment.name.length < 1){
                    this.newDepartmentNameValidation = 'Department name is required'
                    return false
                }

                return true
            },
            resetForm: function(){
                this.submitBtn.loading = true
                this.submitBtn.variant = 'primary'
                setTimeout(() => {
                    this.newDepartment.name = null
                    this.submitBtn.loading = false
                    this.submitBtn.disabled = false
                    this.submitBtn.icon = 'none'
                    this.submitBtn.title = 'Save Another Department'
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
                <label for="departmentName">
                    <h6>Enter Department Name: </h6>
                    <small v-if="newDepartmentNameValidation !== null" class="text-danger">* {{ newDepartmentNameValidation }}</small>
                </label>

                <input type="text" id="departmentName" name="departmentName" :disabled="disabled" v-model="newDepartment.name" placeholder=""
                       required
                       class="form-control ">
            </div>
        </div>

        <p>
            <StateButton :buttonState="submitBtn" @clicked="validateAndSubmit"></StateButton>
        </p>
    </div>

</template>

