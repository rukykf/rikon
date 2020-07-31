<script>
  import SaveOrder from "@views/pages/pos/components/save-order"
  import ErrorHandler from "@src/ErrorHandler"
  import SuccessFailureAlert from "@components/success-failure-alert"

  export default {
    name: "modify-order",
    components: { SuccessFailureAlert, SaveOrder },
    props: {
      order: {
        type: Object,
        required: true,
      },
      departmentItemsOnly: {
        type: Boolean,
        default: false,
      },
    },

    data() {
      return {
        success: [],
        errors: [],
      }
    },

    methods: {
      async modifyOrder(newOrderDetails) {
        try {
          let url = `api/orders/${this.order.id}`

          await this.$httpClient.put(url, {
            item_details: newOrderDetails.orderItems,
            destination: newOrderDetails.destination,
          })
          this.success.push("successfully modified order")

          this.$root.$emit("bv::hide::modal", "modify-order-modal")
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },
    },
  }
</script>

<template>
  <div>
    <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
    <SaveOrder :order="order" :department-items-only="departmentItemsOnly" @updated-order="modifyOrder"></SaveOrder>
  </div>
</template>

<style scoped></style>
