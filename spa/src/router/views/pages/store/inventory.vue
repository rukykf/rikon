<script>
  import appConfig from "@src/app.config"
  import Layout from "@layouts/main"
  import ReceiveStoreItem from "./components/receive-store-item"
  import DisburseStoreItem from "./components/disburse-store-item"
  import QueryStoreItem from "./components/query-store-item"
  import SaveStoreItem from "../../../../components/save-store-item"
  import axios from "axios"
  import { DateTime } from "luxon"
  import JsonExcel from "vue-json-excel"

  /**
   * Starter component
   */
  export default {
    page: {
      title: "Inventory",
      meta: [{ name: "description", content: appConfig.description }],
    },
    components: {
      SaveStoreItem,
      QueryStoreItem,
      DisburseStoreItem,
      ReceiveStoreItem,
      Layout,
      JsonExcel,
    },
    data() {
      return {
        item: {
          id: 8,
          name: "Coca Cola",
          unit: "Dozens",
          quantity: 30,
        },
        query: {
          id: 10,
          item: {
            id: 8,
            name: "Coca Cola",
          },
          date: "12/12/2019",
          expectedQuantity: 30,
          actualQuantity: 20,
        },
        success: [],
        errors: [],
        loading: false,
        selectedItem: {
          unit: null,
          quantity: null,
          name: null,
          id: null,
        },
        items: [],
        fields: [
          { key: "SN", label: "S/N", sortable: false, sortDirection: "desc" },
          { key: "name", label: "Item Name", sortable: true, sortDirection: "desc" },
          { key: "unit", label: "Unit of Measurement", sortable: true, sortDirection: "desc" },
          { key: "quantity", label: "Quantity", sortable: true, sortDirection: "desc" },
          { key: "actions", label: "Actions" },
        ],
        excelFields: {
          "Item Name": "name",
          "Unit of Measurement": "unit",
          Quantity: "quantity",
        },
        totalRows: 1,
        currentPage: 1,
        perPage: 25,
        pageOptions: [10, 25, 50, 100],
        filter: null,
        filterOn: [],
        sortBy: "age",
        sortDesc: false,
      }
    },
    computed: {
      filteredItems: function() {
        return this.items.filter((e) => {
          if (e.name.toLowerCase().contains(this.searchQuery.toLowerCase())) {
            return true
          }
          return false
        })
      },
      rows: function() {
        return this.items.length
      },
      today: function() {
        return DateTime.local().toLocaleString(DateTime.DATE_HUGE)
      },
    },
    mounted: function() {
      this.totalRows = this.items.length
      this.refreshItems()
    },
    methods: {
      /**
       * Search the table data with search input
       */
      onFiltered(filteredItems) {
        // Trigger pagination to update the number of buttons/pages due to filtering
        this.totalRows = filteredItems.length
        this.currentPage = 1
      },

      refreshItems: async function() {
        this.loading = true
        let itemsData = await axios.get("http://localhost:3000/inventoryitems")
        this.items = itemsData.data
        setTimeout(() => {
          this.loading = false
        }, 1500)
      },
      showCreateNewItemModal() {
        this.$bvModal.show("new-item-modal")
      },
      showEditItemModal(item) {
        this.selectedItem = item
        this.$bvModal.show("edit-item-modal")
      },
      showReceiveItemModal(item) {
        this.selectedItem = item
        this.$bvModal.show("receive-item-modal")
      },
      showDisburseItemModal(item) {
        this.selectedItem = item
        this.$bvModal.show("disburse-item-modal")
      },
      showQueryItemModal(item) {
        this.selectedItem = item
        this.$bvModal.show("query-item-modal")
      },
      printItems() {
        this.$htmlToPaper("store-items-print")
      },
    },
  }
</script>

<template>
  <Layout>
    <div class="mt-4"></div>

    <div class="text-left d-print-none">
      <button class="btn btn-primary mr-3" @click.stop.prevent="showCreateNewItemModal">Create New Store Item </button>
    </div>

    <div class="card mt-2">
      <div class="card-body">
        <div v-if="loading">
          <div class="text-center my-5">
            <b-spinner variant="primary" label="Spinning" class="p-5"></b-spinner>
          </div>
        </div>

        <div v-else class="mt-5">
          <div id="store-items-print" v-show="false">
            <div class="row text-center">
              <span class="col-12">
                <img src="@assets/images/rikon-logo.png" alt height="180" />
              </span>
            </div>
            <div class="row text-center mb-5">
              <h3 class="col-12">Stock taken for store on {{ today }}</h3>
            </div>

            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>S/N</th>
                    <th>Item Name</th>
                    <th>Unit of Measurement</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr :key="index" v-for="(item, index) in items">
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.unit }}</td>
                    <td>{{ item.quantity }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="row mb-md-4">
            <div class="col-sm-12 col-md-6">
              <div id="tickets-table_length" class="dataTables_length">
                <label class="d-inline-flex align-items-center">
                  Show&nbsp;
                  <b-form-select v-model="perPage" size="sm" :options="pageOptions"></b-form-select>&nbsp;entries
                </label>
              </div>
            </div>
            <!-- Search -->
            <div class="col-sm-12 col-md-6">
              <div id="tickets-table_filter" class="dataTables_filter text-md-right">
                <label class="d-inline-flex align-items-center">
                  Search:
                  <b-form-input
                    v-model="filter"
                    type="search"
                    placeholder="Search..."
                    class="form-control form-control-sm ml-2"
                  ></b-form-input>
                </label>
              </div>
            </div>
            <!-- End search -->
          </div>

          <div class="row mb-2">
            <h3 class="col-12 col-lg-7"
              >Stock taken for store on <span class="text-info">{{ today }}</span>
            </h3>

            <div class="col-12 col-lg-5 text-right">
              <a href="#" @click.stop.prevent="printItems" class="btn btn-dark mr-3 mb-1">
                <i class="uil uil-print mr-1"></i> Print
              </a>
              <JsonExcel
                class="btn btn-dark mb-1"
                :data="items"
                :fields="excelFields"
                worksheet="Rikon Store"
                name="rikon-store-stock.xls"
              >
                <i class="uil uil-chart-line mr-3"></i> Export to Excel
              </JsonExcel>
            </div>
          </div>

          <!-- Table -->
          <div>
            <div id="store-items" v-show="true" class="table-responsive  table-hover mb-0">
              <b-table
                :items="items"
                :fields="fields"
                responsive="sm"
                :per-page="perPage"
                :current-page="currentPage"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :filter="filter"
                :filter-included-fields="filterOn"
                @filtered="onFiltered"
              >
                <template v-slot:cell(SN)="row">
                  {{ row.index + 1 }}
                </template>

                <template v-slot:cell(actions)="row">
                  <a class="btn btn-primary text-white mx-1" href="#" @click.stop.prevent="showEditItemModal(row.item)"
                    >Edit</a
                  >
                  <a
                    class="btn btn-primary text-white mx-1"
                    href="#"
                    @click.stop.prevent="showReceiveItemModal(row.item)"
                    >Receive Item</a
                  >
                  <a
                    class="btn btn-primary text-white mx-1"
                    href="#"
                    @click.stop.prevent="showDisburseItemModal(row.item)"
                    >Disburse Item</a
                  >
                  <a class="btn btn-primary text-white mx-1" href="#" @click.stop.prevent="showQueryItemModal(row.item)"
                    >Query Item</a
                  >
                </template>
              </b-table>
            </div>
          </div>

          <div class="row">
            <div class="col">
              <div class="dataTables_paginate paging_simple_numbers float-right">
                <ul class="pagination pagination-rounded mb-0">
                  <!-- pagination -->
                  <b-pagination v-model="currentPage" :total-rows="rows" :per-page="perPage"></b-pagination>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <b-modal id="receive-item-modal" size="xl" hide-footer header-bg-variant="dark" :title="selectedItem.name">
      <ReceiveStoreItem :item="selectedItem"></ReceiveStoreItem>
    </b-modal>
    <b-modal id="disburse-item-modal" size="xl" hide-footer header-bg-variant="dark" :title="selectedItem.name">
      <DisburseStoreItem :item="selectedItem"></DisburseStoreItem>
    </b-modal>
    <b-modal id="query-item-modal" size="xl" hide-footer header-bg-variant="dark" :title="selectedItem.name">
      <QueryStoreItem :item="selectedItem"></QueryStoreItem>
    </b-modal>
    <b-modal id="edit-item-modal" size="xl" hide-footer header-bg-variant="dark" :title="selectedItem.name">
      <SaveStoreItem :item="selectedItem"></SaveStoreItem>
    </b-modal>

    <b-modal id="new-item-modal" size="xl" hide-footer header-bg-variant="dark" title="Create New Store Item">
      <SaveStoreItem></SaveStoreItem>
    </b-modal>
  </Layout>
</template>
