<script>
import DisplayCustomerBookingDetails from "./display-customer-booking-details"
import DisplayCustomerOrderDetails from "./display-customer-order-details"

export default {
 name: "display-merged-sale-details",
 components: { DisplayCustomerOrderDetails, DisplayCustomerBookingDetails },
 props: {
  details: {
   type: Object,
   required: true,
  },
 },
 mounted: function() {
  console.log(this.details)
 },
}
</script>

<template>
 <div>
  <div v-for="detail in details.elements">
   <DisplayCustomerBookingDetails
    v-if="detail.type === 'booking'"
    :details="detail.elements"
   ></DisplayCustomerBookingDetails>
   <DisplayCustomerOrderDetails v-if="detail.type === 'order'" :details="detail.elements"></DisplayCustomerOrderDetails>
   <br />
  </div>
 </div>
</template>

<style scoped></style>
