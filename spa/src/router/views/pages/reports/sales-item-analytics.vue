<script>
  import Layout from "@layouts/main"
  import SalesItemsQuantityBreakdown from "@components/shared/sales-items-quantity-breakdown"
  import DetailedSalesItemsAnalyticsBreakdown from "@components/shared/detailed-sales-items-analytics-breakdown"

  export default {
    name: "sales-item-analytics",
    components: { DetailedSalesItemsAnalyticsBreakdown, SalesItemsQuantityBreakdown, Layout },
    data() {
      return {
        tabs: ["Quantity Sold per Item", "More Detailed Analytics per Item"],
        currentTab: "Quantity Sold per Item",
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
        <SalesItemsQuantityBreakdown
          v-if="currentTab === 'Quantity Sold per Item'"
          show-department-filter
        ></SalesItemsQuantityBreakdown>
        <DetailedSalesItemsAnalyticsBreakdown
          v-if="currentTab === 'More Detailed Analytics per Item'"
          show-department-filter
        ></DetailedSalesItemsAnalyticsBreakdown>
      </keep-alive>
    </div>
  </Layout>
</template>

<style scoped></style>
