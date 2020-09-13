<script>
  export default {
    name: "display-booking-payment-details",
    props: {
      booking: {
        type: Object,
        required: true,
      },
      totalCharge: {
        type: Number,
        required: true,
      },
      totalPaid: {
        type: Number,
        required: true,
      },
      totalBalance: {
        type: Number,
        default: 0,
      },
      totalDiscount: {
        type: Number,
        default: 0,
      },
    },
  }
</script>

<template>
  <div>
    <div class="row">
      <p class="col-12">
        Booking of <strong>Room {{ booking.room.room_no }}</strong> for
        <strong>{{ booking.num_nights }} night(s)</strong> at
        <strong>{{ booking.price_per_night | money }} per night</strong> from {{ booking.start_date | humanDate }} to
        {{ booking.end_date | humanDate }} <br />
      </p>
    </div>
    <div class="row">
      <div class="col-lg-6 col-sm-12">
        <strong>TOTAL CHARGE:</strong> {{ totalCharge | money }} <br />
        <strong>TOTAL PAID:</strong> {{ totalPaid | money }} <br />
        <strong>TOTAL BALANCE DUE:</strong> {{ totalBalance | money }} <br />
        <strong>TOTAL DISCOUNT / COMPLEMENTARY:</strong> {{ totalDiscount | money }} <br />
      </div>
      <div class="col-lg-6 col-sm-12" v-if="booking.sale != null">
        <strong>TRANSACTION TYPE:</strong> {{ booking.sale.transaction_type | capitalizeAll }} <br />
        <span v-if="booking.sale.customer_details != null">
          <strong>CUSTOMER NAME:</strong> {{ booking.sale.customer_details.name | capitalizeAll }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
