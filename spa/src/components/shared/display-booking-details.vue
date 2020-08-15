<script>
  export default {
    name: "display-booking-details",
    props: {
      booking: {
        type: Object,
        required: true,
      },
    },
  }
</script>

<template>
  <div>
    <p>
      Booking of <strong>Room {{ booking.room.room_no }}</strong> for
      <strong>{{ booking.num_nights }} night(s)</strong> at
      <strong>{{ booking.price_per_night | money }} per night</strong> from {{ booking.start_date | humanDate }} to
      {{ booking.end_date | humanDate }}
    </p>
    <p v-if="booking.status === 'closed'">
      STATUS: CLOSED
    </p>
    <p v-else-if="booking.status === 'open'">
      STATUS: OPEN
    </p>
    <p v-else>
      STATUS: CLOSED
    </p>
  </div>
</template>

<style scoped></style>
