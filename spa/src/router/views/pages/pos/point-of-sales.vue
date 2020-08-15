<script>
  import appConfig from "@src/app.config"
  import Layout from "@layouts/main"
  import ErrorHandler from "@src/ErrorHandler"
  import SuccessFailureAlert from "../../../../components/success-failure-alert"
  import ManagedStateButton from "../../../../components/managed-state-button"
  import FulfillOrder from "./components/fulfill-order"
  import CancelOrder from "./components/cancel-order"
  import AdditionalDetails from "./components/waitress-serial-no-details"
  import ModifyOrder from "@views/pages/pos/components/modify-order"

  /**
   * Starter component
   */
  export default {
    page: {
      title: "Point of Sales",
      meta: [{ name: "description", content: appConfig.description }],
    },
    components: {
      ModifyOrder,
      AdditionalDetails,
      CancelOrder,
      FulfillOrder,
      ManagedStateButton,
      SuccessFailureAlert,
      Layout,
    },
    data() {
      return {
        pendingOrders: [],
        itemsForSale: [],
        destinations: [],
        departmentItemsOnly: false,
        placeOrderBtnState: "initialize",
        pollPendingOrdersIntervalId: null,
        department: this.$store.state.auth.currentDepartment,
        currentTab: "items",
        searchQuery: null,
        loading: true,
        selectedOrderIndex: null,
        selectedOrder: {},
        orderPaymentState: "initialize",
        orderPaymentDisabled: false,
        errors: [],
        success: [],
        newOrder: {
          salesItems: [],
          orderItems: [],
          destination: "Dining Hall",
          total: null,
        },
      }
    },
    computed: {
      filteredItemsList: function() {
        return this.itemsForSale.filter((e) => {
          if (this.searchQuery !== null) {
            return e.name.toLowerCase().includes(this.searchQuery.toLowerCase())
          }
          return true
        })
      },
      pendingOrdersCount: function() {
        if (this.pendingOrders.orders) {
          return this.pendingOrders.orders.length
        }
        return null
      },
    },

    watch: {
      "newOrder.orderItems": {
        deep: true,
        handler: function(val) {
          this.newOrder.total = 0
          this.newOrder.orderItems.forEach((e) => {
            this.newOrder.total += e.subTotal
          })
        },
      },

      departmentItemsOnly: function(newVal, oldVal) {
        this.getSalesItemsData()
        this.getPendingOrdersData()
      },
    },

    mounted: async function() {
      try {
        this.loading = true
        await this.getSalesItemsData()
        await this.getPendingOrdersData()
        // Refresh the pending orders every 6 minutes
        this.pollPendingOrdersIntervalId = setInterval(() => {
          this.getPendingOrdersData()
        }, 360000)
        this.loading = false
      } catch (error) {
        this.loading = false
        let errors = ErrorHandler(error)
        this.errors.push(...errors)
      }
    },

    beforeDestroy() {
      clearInterval(this.pollPendingOrdersIntervalId)
    },

    methods: {
      getSalesItemsData: async function() {
        let url = "api/point-of-sales"

        if (this.departmentItemsOnly === true) {
          url += `?department_id=${this.department.id}`
        }
        let response = await this.$httpClient.get(url)
        this.itemsForSale = response.data

        response = await this.$httpClient.get("api/rooms")
        let rooms = response.data
        this.destinations = ["Dining Hall", "Garden", "Bar"]
        rooms.forEach((room) => {
          this.destinations.push(`Room ${room.display_no}`)
        })
      },

      getPendingOrdersData: async function() {
        try {
          this.loading = true
          let url = "api/orders?status=pending"

          if (this.departmentItemsOnly === true) {
            url += `&department=${this.department.name}`
          }
          let response = await this.$httpClient.get(url)
          this.pendingOrders = response.data
          this.selectedOrder = {}
          this.loading = false
        } catch (error) {
          this.loading = false
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      placeOrder: async function() {
        try {
          this.placeOrderBtnState = "loading"
          await this.$httpClient.post("api/orders", {
            item_details: this.newOrder.orderItems,
            destination: this.newOrder.destination,
          })
          await this.getPendingOrdersData()
          this.success.push("Successfully placed new order")
          this.newOrder.orderItems = []
          this.newOrder.salesItems = []
          this.newOrder.destination = "Dining Hall"
          this.placeOrderBtnState = "initialize"
        } catch (error) {
          this.placeOrderBtnState = "fail-try-again"
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      showFulfillOrderModal: function(orderIndex) {
        this.selectedOrder = this.pendingOrders.orders[orderIndex]
        this.$bvModal.show("fulfill-order-modal")
      },

      showModifyOrderModal: function(orderIndex) {
        this.selectedOrder = this.pendingOrders.orders[orderIndex]
        this.$bvModal.show("modify-order-modal")
      },

      showCancelOrderModal: function(orderIndex) {
        this.selectedOrder = this.pendingOrders.orders[orderIndex]
        this.$bvModal.show("cancel-order-modal")
      },

      showAdditionalDetailsModal: function(orderIndex) {
        this.selectedOrder = this.pendingOrders.orders[orderIndex]
        this.$bvModal.show("additional-details-modal")
      },

      addItemToNewOrder: function(id) {
        this.success = []
        this.errors = []
        let item = this.itemsForSale[id]
        this.itemsForSale.forEach((el) => {
          if (el.id === id) {
            item = el
          }
        })

        let isAdditionValid = true
        this.newOrder.orderItems.forEach((el) => {
          if (el.id === item.id) {
            isAdditionValid = false
          }
        })

        if (isAdditionValid) {
          this.newOrder.orderItems.push({
            name: item.name,
            id: item.id,
            quantity: 1,
            sales_item_id: item.id,
            price_per_unit: item.price_per_unit,
            subTotal: item.price_per_unit,
          })
        }
      },

      incrementItemQuantityInNewOrder: function(index) {
        let item = this.newOrder.orderItems[index]
        item.quantity += 1
        item.subTotal = item.quantity * item.price_per_unit
        this.newOrder.orderItems[index] = item
      },

      decrementItemQuantityInNewOrder: function(index) {
        let item = this.newOrder.orderItems[index]
        item.quantity -= 1
        if (item.quantity === 0) {
          item.quantity = 1
        }
        item.subTotal = item.quantity * item.price_per_unit
        this.newOrder.orderItems[index] = item
      },

      removeItemFromNewOrder: function(index) {
        let item = this.newOrder.orderItems[index]
        this.newOrder.orderItems.splice(index, 1)
      },
    },
  }
</script>

<template>
  <Layout>
    <div class="form-inline mt-5">
      <b class="font-weight-bold mr-2">All Department Items</b>
      <b-form-checkbox v-model="departmentItemsOnly" name="check-button" switch size="lg">
        <b class="mr-2 font-weight-bold">{{ department.name | capitalize }} Items only</b>
      </b-form-checkbox>
    </div>

    <b-nav tabs justified class="mt-5">
      <b-nav-item :active="currentTab === 'items'" @click="currentTab = 'items'">
        <h5 :class="currentTab === 'items' ? 'font-weight-bold' : 'font-weight-normal'">Place an Order</h5>
      </b-nav-item>
      <b-nav-item :active="currentTab === 'pending'" @click="currentTab = 'pending'">
        <h5 :class="currentTab === 'pending' ? 'font-weight-bold' : 'font-weight-normal'"
          >Pending Orders
          <b-badge v-if="pendingOrdersCount > 0" variant="danger">{{ pendingOrdersCount }}</b-badge>
        </h5>
      </b-nav-item>
    </b-nav>

    <div class="mt-3">
      <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
    </div>

    <div v-if="loading" class="text-center mt-5">
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div>
    <div v-else-if="currentTab === 'items'" class="row mt-5">
      <div class="col-12 col-lg-5">
        <div class="card">
          <div class="card-body">
            <table v-if="newOrder.orderItems.length > 0" class="table table-borderless table-responsive table-hover">
              <thead>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Sub-Total</th>
              </thead>

              <tbody>
                <tr :key="index" v-for="(item, index) in newOrder.orderItems">
                  <td>{{ item.name.toUpperCase() }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ item.subTotal | money }}</td>
                  <td>
                    <a
                      href="#"
                      class="p-0 pr-lg-2"
                      v-b-tooltip.hover
                      title="Increase quantity by 1"
                      @click.prevent.stop="incrementItemQuantityInNewOrder(index)"
                    >
                      <feather type="plus-circle"></feather>
                    </a>
                    <a
                      href="#"
                      class="p-0 pr-lg-2"
                      v-b-tooltip.hover
                      title="Decrease quantity by 1"
                      @click.prevent.stop="decrementItemQuantityInNewOrder(index)"
                    >
                      <feather type="minus-circle"></feather>
                    </a>
                    <a
                      href="#"
                      class="p-0 pr-lg-2"
                      v-b-tooltip.hover
                      title="Remove item from list"
                      @click.prevent.stop="removeItemFromNewOrder(index)"
                    >
                      <feather type="x-circle"></feather>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td class="font-weight-bold">Total:</td>
                  <td></td>
                  <td class="font-weight-bold">{{ newOrder.total | money }}</td>
                </tr>
              </tbody>

              <div class="form-group mt-2 pl-2">
                <label class="font-weight-bold">Select Destination:</label>
                <select class="form-control" v-model="newOrder.destination">
                  <option :key="destination" v-for="destination in destinations" :value="destination">
                    {{ destination }}
                  </option>
                </select>
              </div>
              <ManagedStateButton
                main-title="Place Order"
                :state="placeOrderBtnState"
                @clicked="placeOrder"
              ></ManagedStateButton>
            </table>
            <div v-else class="pl-3">
              Select an Item to create a new order
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-7">
        <div class="row mx-3">
          <div class="col-12 mb-3 input-group">
            <input type="text" class="form-control" placeholder="Search..." v-model="searchQuery" />
          </div>
          <a
            :key="index"
            v-for="(item, index) in filteredItemsList"
            @click.stop.prevent="addItemToNewOrder(item.id)"
            href="#"
            class="text-center col-6 col-lg-3"
          >
            <b-card bg-variant="white" text-variant="dark" class="border border-primary">
              <b-card-text class="px-1 py-3 text-wrap"
                >{{ item.name.toUpperCase() }} <br />
                {{ item.price_per_unit | money }}<br /><br />
                <span class="font-italic text-secondary">per {{ item.unit | capitalize }}</span>
              </b-card-text>
            </b-card>
          </a>
        </div>
      </div>
    </div>
    <div v-else-if="currentTab === 'pending'" class="mt-5">
      <div class="orders card" v-for="(order, index) in pendingOrders.orders" :key="index">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-borderless">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Date/Time</th>
                  <th>Items</th>
                  <th>Order Total</th>
                  <th>Destination</th>
                  <th>Waiter/Waitress</th>
                  <th>Docket Serial No.</th>
                  <th>Placed By</th>
                  <th>Department(s)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{{ index + 1 }}</td>
                  <td
                    >{{ order.created_at | humanDate }}
                    <span class="font-italic ml-1">{{ order.created_at | humanTime | capitalizeAll }}</span></td
                  >
                  <td>
                    <table class="table-hover">
                      <thead class="font-italic font-weight-lighter">
                        <tr>
                          <th>Name</th>
                          <th>Quantity</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(item, itemIndex) in order.order_items" :key="itemIndex">
                          <td>{{ item.name.toUpperCase() }}</td>
                          <td>{{ item.quantity }}</td>
                          <td>{{ (item.quantity * item.price_per_unit) | money }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td>{{ order.amount | money }}</td>
                  <td>{{ order.destination.toUpperCase() }}</td>
                  <td>
                    <span v-if="order.delivered_by !== null" class="text-info">{{
                      order.delivered_by.name | capitalizeAll
                    }}</span>
                    <span v-else class="text-danger">NIL</span>
                  </td>
                  <td>{{ order.docket_serial_no }}</td>
                  <td>{{ order.placed_by.name.toUpperCase() | capitalize }}</td>
                  <td>{{ order.departments }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="float-right">
            <b-button variant="dark" class="mx-3 mb-1" @click.prevent.stop="showModifyOrderModal(index)">
              <span class="align-middle">Modify Order</span>
            </b-button>
            <b-button variant="secondary" class="mx-3 mb-1" @click.prevent.stop="showAdditionalDetailsModal(index)">
              <span class="align-middle">Save Waiter / Waitress / Serial No. Details</span>
            </b-button>
            <b-button variant="primary" class="mx-3 mb-1" @click.prevent.stop="showFulfillOrderModal(index)">
              <feather type="check" class="align-middle"></feather>
              <span class="align-middle">Mark as Fulfilled</span>
            </b-button>
            <b-button variant="danger" class="mb-1" @click.prevent.stop="showCancelOrderModal(index)">
              <feather type="x" class="align-middle"></feather>
              <span class="align-middle">Cancel</span>
            </b-button>
          </div>
        </div>
      </div>
    </div>

    <b-modal
      id="fulfill-order-modal"
      @hide="getPendingOrdersData"
      size="lg"
      hide-footer
      header-bg-variant="dark"
      title="Record Order Payment and Fulfill Order"
    >
      <FulfillOrder :order="selectedOrder"></FulfillOrder>
    </b-modal>

    <b-modal
      id="modify-order-modal"
      @hide="getPendingOrdersData"
      size="xl"
      hide-footer
      header-bg-variant="dark"
      title="Modify Order"
    >
      <ModifyOrder :order="selectedOrder" :department-items-only="departmentItemsOnly"></ModifyOrder>
    </b-modal>

    <b-modal
      id="cancel-order-modal"
      @hide="getPendingOrdersData"
      size="lg"
      hide-footer
      header-bg-variant="dark"
      title="Cancel Order"
    >
      <CancelOrder :order="selectedOrder"></CancelOrder>
    </b-modal>

    <b-modal
      id="additional-details-modal"
      @hide="getPendingOrdersData"
      size="lg"
      hide-footer
      header-bg-variant="dark"
      title="Add Additional Details"
    >
      <AdditionalDetails :order.sync="selectedOrder"></AdditionalDetails>
    </b-modal>
  </Layout>
</template>
<style scoped>
  .orders.table {
    width: 100%;
  }
</style>
