<script>
    import StateButton from "@components/state-button"
    import SuccessFailureAlert from "@components/success-failure-alert"

    export default {
        name: "disburse-store-item",
        components: {SuccessFailureAlert, StateButton},
        props: {
            item: {
                type: Object,
                required: true
            },
            entry: {
                type: Object,
                default: function(){
                    return {
                        quantity: null,
                        department: 'kitchen'
                    }
                }
            }
        },
        data: function(){
            return {
                submitBtn: {
                    title: "Disburse Items",
                    variant: "primary",
                    loading: false,
                    disabled: false,
                    icon: 'none'
                },
                newEntryQuantityValidation: null,
                newEntry: {
                    quantity: this.entry.quantity,
                    department: this.entry.department
                },
                disabled: false,
                errors: [],
                success: [],
                warnings: [],
                displayWarning: false,
                departments: ['kitchen', 'bar', 'reception', 'hotel']
            }
        },
        computed: {
            newEntryQuantity: function(){
                if(this.newEntry.quantity === null){
                    return 'XXXX'
                }
                return this.newEntry.quantity
            }
        },
        methods: {
            validateAndSubmit: function(){
                if(this.isValid()){
                    this.newEntryQuantityValidation = null
                    this.submitBtn.loading = true
                    setTimeout(() => {
                        this.submitBtn.variant = 'success'
                        this.submitBtn.loading = false
                        this.submitBtn.disabled = true
                        this.submitBtn.icon = 'check'
                        this.submitBtn.title = "Success"
                        this.disabled = true
                        this.$emit('store-item-disbursed', this.newEntry)
                        this.success.push(`Successfully disbursed ${this.newEntry.quantity} ${this.item.unit} of ${this.item.name}`)
                    }, 1200)
                }
            },
            isValid: function(){
                if(this.newEntry.quantity < 1){
                    this.newEntryQuantityValidation = 'Enter a valid quantity that is greater than 0'
                    return false
                }

                if(this.newEntry.quantity > this.item.quantity && this.displayWarning === false){
                    let warning = `There are only ${this.item.quantity} ${this.item.unit} of ${this.item.name} in stock are you sure you want to continue?`
                    this.warnings.push(warning)
                    this.newEntryQuantityValidation = warning
                    this.displayWarning = true
                    this.submitBtn.variant = 'info'
                    this.submitBtn.title = `Continue disbursal of ${this.item.name}`
                    return false
                }

                return true
            }
        }
    }
</script>

<template>

    <div>
        <SuccessFailureAlert :errors="errors" :success="success" :warnings="warnings"></SuccessFailureAlert>
        <div class="pt-3">
            <h4>Disburse <span class="text-info">({{ newEntryQuantity }})</span> {{ item.unit }} of <span class="text-info">{{ item.name }}</span> to <span class="text-info">{{entry.department}}</span></h4>
            <div class="form-group">
                <label for="entryQuantity">
                    <h6>Enter Quantity: </h6>
                    <small v-if="newEntryQuantityValidation !== null" class="text-danger">* {{ newEntryQuantityValidation }}</small>
                </label>

                <input type="number" id="entryQuantity" name="entryQuantity" :disabled="disabled" v-model.number="newEntry.quantity" placeholder=""
                       required
                       class="form-control ">
            </div>

            <div class="form-group">
                <label for="entryDepartment">
                    <h6>Select Department:</h6>
                </label>

                <select :disabled="disabled" id="entryDepartment" class="form-control" v-model="entry.department">
                    <option :key="index" v-for="department in departments" :value="department">{{department}}</option>
                </select>
            </div>
        </div>

        <p>
            <StateButton :buttonState="submitBtn" @clicked="validateAndSubmit"></StateButton>
        </p>
    </div>

</template>

