<script>
    import StateButton from "./state-button";
    import SuccessFailureAlert from "./success-failure-alert";

    export default {
        name: "save-room",
        components: {SuccessFailureAlert, StateButton},
        props: {
            room: {
                type: Object,
                default: function(){
                    return {
                        number: null,
                        type: 7
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
                    title: "Save Room",
                    variant: "primary",
                    loading: false,
                    disabled: false,
                    icon: 'none'
                },
                newRoomNumberValidation: null,
                newRoomTypeValidation: null,
                roomTypes: [
                    {
                        id: 7,
                        name: 'deluxe'
                    },
                    {
                        id: 8,
                        name: 'standard'
                    },
                    {
                        id: 9,
                        name: 'classic'
                    }
                ],
                newRoom: this.room,
                disabled: false,
                errors: [],
                success: []
            }
        },
        methods: {
            validateAndSubmit: function(){
                if(this.isValid()){
                    this.newRoomNumberValidation = null
                    this.newRoomTypeValidation = null
                    this.submitBtn.loading = true
                    setTimeout(() => {
                        this.submitBtn.variant = 'success'
                        this.submitBtn.loading = false
                        this.submitBtn.disabled = true
                        this.submitBtn.icon = 'check'
                        this.submitBtn.title = "Success"
                        this.disabled = true
                        this.$emit('room-saved', this.newRoom)
                        this.success.push('Successfully saved')
                        if(this.addMultiple){
                            this.resetForm()
                        }
                    }, 1200)
                }
            },
            isValid: function(){
                if(this.newRoom.number < 100 || this.newRoom.number > 350){
                    this.newRoomNumberValidation = 'Enter a valid room number between 100 and 350'
                    return false
                }

                if(this.newRoom.type  === null){
                    this.newRoomTypeValidation = 'Please select a valid room type'
                    return false
                }

                return true
            },
            resetForm: function(){
                this.submitBtn.loading = true
                setTimeout(() => {
                    this.newRoom.number = null
                    this.newRoom.type = null
                    this.submitBtn.loading = false
                    this.submitBtn.disabled = false
                    this.submitBtn.icon = 'none'
                    this.submitBtn.title = 'Save Another Room'
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
                <label for="roomNumber">
                    <h6>Enter Room Number: </h6>
                    <small v-if="newRoomNumberValidation !== null" class="text-danger">* {{ newRoomNumberValidation }}</small>
                </label>

                <input type="number" id="roomNumber" name="roomNumber" :disabled="disabled" v-model.number="newRoom.number" placeholder="e.g 103"
                       required
                       class="form-control ">
            </div>

            <div class="form-group">
                <label for="roomType">
                    <h6>Select the type of room</h6>
                    <small v-if="newRoomTypeValidation !== null" class="text-danger">* {{ newRoomTypeValidation }}</small>
                </label>

                <select :disabled="disabled" id="roomType" class="form-control" v-model="newRoom.type">
                    <option :key="index" v-for="(type, index) in roomTypes" :value="type.id">{{type.name}}</option>
                </select>
            </div>
        </div>

        <p>
            <StateButton :buttonState="submitBtn" @clicked="validateAndSubmit"></StateButton>
        </p>
    </div>

</template>

