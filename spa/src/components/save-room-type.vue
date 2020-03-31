<script>
    import StateButton from "./state-button";
    import SuccessFailureAlert from "./success-failure-alert";

    export default {
        name: "save-room-type",
        components: {SuccessFailureAlert, StateButton},
        props: {
            roomType: {
                type: Object,
                default: function(){
                    return {
                        name: null,
                        pricePerNight: null
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
                    title: "Save Room Type",
                    variant: "primary",
                    loading: false,
                    disabled: false,
                    icon: 'none'
                },
                newRoomTypeNameValidation: null,
                newRoomTypePricePerNightValidation: null,
                newRoomType: this.roomType,
                disabled: false,
                errors: [],
                success: []
            }
        },
        methods: {
            validateAndSubmit: function(){
                if(this.isValid()){
                    this.newRoomTypeNameValidation = null
                    this.newRoomTypePricePerNightValidation = null
                    this.submitBtn.loading = true
                    setTimeout(() => {
                        this.submitBtn.variant = 'success'
                        this.submitBtn.loading = false
                        this.submitBtn.disabled = true
                        this.submitBtn.icon = 'check'
                        this.submitBtn.title = "Success"
                        this.disabled = true
                        this.$emit('room-type-saved', this.newRoomType)
                        this.success.push('Successfully saved')
                        if(this.addMultiple){
                            this.resetForm()
                        }
                    }, 1200)
                }
            },
            isValid: function(){
                if(this.newRoomType.name === null || this.newRoomType.name.length < 1){
                    this.newRoomTypeNameValidation = 'Name is required'
                    return false
                }

                if(this.newRoomType.pricePerNight < 1000){
                    this.newRoomTypePricePerNightValidation = 'Enter a valid amount in naira that is at least N1000'
                    return false
                }

                return true
            },
            resetForm: function(){
                this.submitBtn.loading = true
                setTimeout(() => {
                    this.newRoomType.name = null
                    this.newRoomType.pricePerNight = null
                    this.submitBtn.loading = false
                    this.submitBtn.disabled = false
                    this.submitBtn.icon = 'none'
                    this.submitBtn.title = 'Save Another Room Type'
                    this.submitBtn.variant = 'primary'
                    this.disabled = false
                }, 1000)

            }
        }
    }
</script>

<template>

    <div>
        <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
        <div class="pt-3">
            <div class="form-group">
                <label for="roomTypeName">
                    <h6>Enter Name of Room Type: </h6>
                    <small v-if="newRoomTypeNameValidation !== null" class="text-danger">* {{ newRoomTypeNameValidation }}</small>
                </label>

                <input type="text" id="roomTypeName" name="roomTypeName" :disabled="disabled" v-model="newRoomType.name" placeholder="e.g Deluxe"
                       required
                       class="form-control ">
            </div>

            <div class="form-group">
                <label for="roomTypePricePerNight">
                    <h6>Enter Price per Night (Naira): </h6>
                    <small v-if="newRoomTypePricePerNightValidation !== null" class="text-danger">* {{ newRoomTypePricePerNightValidation }}</small>
                </label>

                <input type="number" id="roomTypePricePerNight" name="roomTypePricePerNight" :disabled="disabled" v-model.number="newRoomType.pricePerNight" placeholder=""
                       required
                       class="form-control ">
            </div>
        </div>

        <p>
            <StateButton :buttonState="submitBtn" @clicked="validateAndSubmit"></StateButton>
        </p>
    </div>

</template>

