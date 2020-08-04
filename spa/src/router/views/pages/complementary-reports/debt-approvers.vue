<script>
  import Layout from "@layouts/main"
  import CollectCash from "@components/collect-payment/collect-cash-payment"
  import CollectCredit from "@components/collect-payment/collect-credit"
  import CollectExactCashPayment from "@components/collect-payment/collect-exact-cash-payment"
  import CollectDiscountPayment from "@components/collect-payment/collect-discount-payment"
  import CollectComplementaryPayment from "@components/collect-payment/collect-complementary-payment"

  export default {
    name: "debt-approvers",
    components: {
      CollectExactCashPayment,
      Layout,
      CollectCash,
      CollectCredit,
      CollectDiscountPayment,
      CollectComplementaryPayment,
    },
  }
</script>

<template>
  <Layout>
    <CollectCash></CollectCash>
    <CollectCredit></CollectCredit>
    <CollectExactCashPayment></CollectExactCashPayment>
    <CollectDiscountPayment></CollectDiscountPayment>
    <CollectComplementaryPayment></CollectComplementaryPayment>
  </Layout>
</template>

<style scoped></style>
