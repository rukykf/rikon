<script>
    import CollectCredit from "./collect-credit";
    import CollectCashPayment from "./collect-cash-payment";
    export default {
        name: "collect-payment",
        components: {CollectCashPayment, CollectCredit},
        props: {
            takeCredit: {
                type: Boolean,
                default: false
            },
            state: {
                type: String,
                default: 'initialize'
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        data: function() {
            return {
                creditForm: false
            }
        },
        computed: {
        },
        methods: {
            collectCashPayment: function(paymentInfo){
                paymentInfo.type = 'cash'
                this.$emit('submit-payment', paymentInfo)
            },

            collectCreditPayment: function(paymentInfo){
                paymentInfo.type = 'credit'
                this.$emit('submit-payment', paymentInfo)
            }
        }
    }
</script>

<template>
    <div>
        <div>
            <h4>Add Payment</h4>
            <div>
                <div class="form-inline" v-if="takeCredit">
                    <b class="mr-2 font-weight-bold">Cash</b> <b-form-checkbox  :disabled="disabled" v-model="creditForm" name="check-button" switch>
                        <b class="font-weight-bold">Credit</b>
                    </b-form-checkbox>
                </div>


                <CollectCredit :state="state" v-if="creditForm" :disabled="disabled" @clicked="collectCreditPayment"></CollectCredit>
                <CollectCashPayment :state="state" v-else :disabled="disabled" @clicked="collectCashPayment"></CollectCashPayment>
            </div>
        </div>

    </div>
</template>
