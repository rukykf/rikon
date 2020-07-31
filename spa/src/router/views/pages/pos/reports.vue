<script>
  import Layout from "@layouts/main"
  import CashPosDebtSalesBreakdown from "@views/pages/pos/components/cash-pos-debt-sales-breakdown"
  import SalesItemsQuantityBreakdown from "@views/pages/pos/components/sales-items-quantity-breakdown"
  import OrderHistory from "@views/pages/pos/components/order-history"

  export default {
    name: "reports",
    components: {
      OrderHistory,
      SalesItemsQuantityBreakdown,
      CashPosDebtSalesBreakdown,
      Layout,
    },

    data() {
      return {
        tabs: ["Order History", "Item Quantity Breakdown", "Cash, POS, Debt Breakdown"],
        currentTab: "Order History",
        errors: [],
        success: [],
      }
    },
  }
</script>

<template>
  <Layout>
    <div class="mt-5">
      <b-nav tabs justified>
        <b-nav-item v-for="tab in tabs" :key="tab" :active="currentTab === tab" @click="currentTab = tab">
          <h5 :class="currentTab === tab ? 'font-weight-bold' : 'font-weight-normal'">{{
            tab[0].toUpperCase() + tab.slice(1)
          }}</h5>
        </b-nav-item>
      </b-nav>

      <keep-alive>
        <order-history v-if="currentTab === 'Order History'"></order-history>
        <sales-items-quantity-breakdown
          v-else-if="currentTab === 'Item Quantity Breakdown'"
        ></sales-items-quantity-breakdown>
        <cash-pos-debt-sales-breakdown
          v-else-if="currentTab === 'Cash, POS, Debt Breakdown'"
        ></cash-pos-debt-sales-breakdown>
      </keep-alive>
    </div>
  </Layout>
</template>

<style scoped></style>
