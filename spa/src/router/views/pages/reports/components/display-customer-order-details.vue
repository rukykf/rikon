<script>
  export default {
    name: "display-customer-order-details",
    props: {
      details: {
        type: Object,
        required: true,
      },
    },
  }
</script>

<template>
  <div>
    <b-row class="mb-2">
      <b-col sm="3" class="text-sm-right"><b>Order Date:</b></b-col>
      <b-col
        >{{ details.created_at | humanDate }} <span class="font-italic">{{ details.created_at | humanTime }}</span>
      </b-col>
    </b-row>

    <b-row class="mb-2">
      <b-col sm="3" class="text-sm-right"><b>Order Last Updated:</b></b-col>
      <b-col
        >{{ details.updated_at | humanDate }} <span class="font-italic">{{ details.updated_at | humanTime }}</span>
      </b-col>
    </b-row>

    <b-row class="mb-2">
      <b-col sm="3" class="text-sm-right"><b>Order Amount:</b></b-col>
      <b-col>{{ details.amount | money }}</b-col>
    </b-row>
    <b-row class="mb-2">
      <b-col sm="3" class="text-sm-right"><b>Order Destination:</b></b-col>
      <b-col>{{ details.destination }}</b-col>
    </b-row>
    <b-row class="mb-2">
      <b-col sm="3" class="text-sm-right"><b>Order Placed By:</b></b-col>
      <b-col>{{ details.placed_by.name }}</b-col>
    </b-row>

    <b-row class="mb-2">
      <b-col sm="3" class="text-sm-right"><b>Order Delivered By:</b></b-col>
      <b-col>{{ details.delivered_by.name }}</b-col>
    </b-row>
    <b-row class="mb-2">
      <b-col sm="3" class="text-sm-right"><b>Order Details:</b></b-col>
      <b-col>
        <b-row>
          <b-col cols="12" v-for="item in details.order_items"
            >{{ item.quantity }} {{ item.unit }}(s) of {{ item.name }} at {{ item.price_per_unit | money }} per unit
            with total of {{ item.amount | money }}
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </div>
</template>

<style scoped></style>
