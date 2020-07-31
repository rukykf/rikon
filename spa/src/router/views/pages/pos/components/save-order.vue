<script>
  import ErrorHandler from "@src/ErrorHandler"
  import ManagedStateButton from "@components/managed-state-button"

  export default {
    name: "save-order",
    components: { ManagedStateButton },
    props: {
      order: {
        type: Object,
        default: null,
      },
      departmentItemsOnly: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        itemsForSale: [],
        destinations: [],
        placeOrderBtnState: "initialize",
        department: this.$store.state.auth.currentDepartment,
        searchQuery: null,
        loading: false,
        newOrder: {
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
    },

    mounted() {
      if (this.order !== null) {
        this.order.order_items.forEach((orderItem) => {
          this.newOrder.orderItems.push({
            name: orderItem.name,
            id: orderItem.sales_item_id,
            sales_item_id: orderItem.sales_item_id,
            quantity: orderItem.quantity,
            price_per_unit: orderItem.price_per_unit,
            subTotal: orderItem.quantity * orderItem.price_per_unit,
          })
        })
        this.newOrder.destination = this.order.destination
      }
      this.getSalesItemsData()
    },

    methods: {
      getSalesItemsData: async function() {
        try {
          this.loading = true
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
          this.loading = false
        } catch (error) {
          this.loading = false
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      saveOrderChanges: async function() {
        this.$emit("updated-order", this.newOrder)
        this.loading = true
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
      },
    },
  }
</script>

<template>
  <div>
    <div v-if="loading" class="text-center">
      <b-spinner class="p-5 m-5"></b-spinner>
    </div>
    <div v-else class="row mt-5">
      <div class="col-12 col-lg-5">
        <div class="card">
          <div class="card-body">
            <table v-if="newOrder.orderItems.length > 0" class="table table-borderless table-responsive table-hover">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Sub-Total</th>
                </tr>
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
                main-title="Save Changes"
                :state="placeOrderBtnState"
                @clicked="saveOrderChanges"
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
            class="text-center col-6 col-lg-4"
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
  </div>
</template>

<style scoped></style>
