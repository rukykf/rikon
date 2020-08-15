<script>
  export default {
    name: "display-order-items",
    props: {
      orderItems: {
        type: Array,
        required: true,
      },
    },
  }
</script>

<template>
  <div>
    <ul>
      <li v-for="item in orderItems"
        ><strong>{{ item.quantity }}</strong> {{ item.unit }}(s) of {{ item.name | capitalizeAll }} at
        {{ item.price_per_unit | money }} per {{ item.unit }} with total of <strong>{{ item.amount | money }}</strong>
      </li>
    </ul>
  </div>
</template>

<style scoped></style>
