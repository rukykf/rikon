<script>
  export default {
    name: "display-record-actions-btn",
    props: {
      record: {
        type: Object,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        collectPaymentFormState: "initialize",
      }
    },

    methods: {
      clicked() {
        this.$emit("clicked")
      },
    },
  }
</script>

<template>
  <div>
    <div v-if="record.sale.total_due !== 0 && record.sale.transaction_type !== 'company'">
      <a class="btn btn-danger" @click.stop.prevent="clicked" href="#">Record Recovered Debt</a>
    </div>
  </div>
</template>

<style scoped></style>
