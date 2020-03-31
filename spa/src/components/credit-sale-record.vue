<script>
    import { formatMoney } from 'accounting-js'

    export default {
        name: "credit-sale-record",
        props: {
            record: {
                type: Object,
                required: true
            }
        },
        methods: {
            formatSaleItem(money){
                if(money === 0){
                    return formatMoney(money, {symbol: 'N', precision: 2})
                }
                return formatMoney(money, {symbol: 'N', precision: 0})
            }
        }
    }
</script>
<template>
    <div>
        <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Date:</b></b-col>
            <b-col>{{ record.dateCreated }}</b-col>
        </b-row>

        <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Customer Info:</b></b-col>
            <b-col>{{ record.customerInfo }}</b-col>
        </b-row>

        <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Total Due:</b></b-col>
            <b-col>{{ formatSaleItem(record.totalDue) }}</b-col>
        </b-row>

        <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Total Paid:</b></b-col>
            <b-col>{{ formatSaleItem(record.totalPaid) }}</b-col>
        </b-row>

        <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Balance Due:</b></b-col>
            <b-col>{{ formatSaleItem(record.balanceDue) }}</b-col>
        </b-row>

        <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Status:</b></b-col>
            <b-col>{{ record.status }}</b-col>
        </b-row>

        <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Order Details:</b></b-col>
            <b-col>{{ record.details }}</b-col>
        </b-row>
        <div class="row mt-2">
            <div class="col-12 text-left">
                <button class="btn btn-primary mt-1">Add Payment</button>
                <button class="btn btn-secondary ml-sm-2 mt-1">Mark as Complementary</button>
                <button class="btn btn-dark ml-sm-2 mt-1">Add Discount</button>
            </div>
        </div>
    </div>
</template>