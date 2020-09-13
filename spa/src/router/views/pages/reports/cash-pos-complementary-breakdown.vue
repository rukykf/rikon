<script>
  import Layout from "@layouts/main"
  import CashPosDebtSalesBreakdown from "@components/shared/cash-pos-debt-sales-breakdown"

  export default {
    name: "cash-pos-complementary-breakdown",
    components: {
      CashPosDebtSalesBreakdown,
      Layout,
    },
  }
</script>

<template>
  <Layout>
    <CashPosDebtSalesBreakdown show-department-filter></CashPosDebtSalesBreakdown>
  </Layout>
</template>

<style scoped></style>
