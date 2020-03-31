<script>
    import appConfig from '@src/app.config'
    import Layout from '@layouts/main'
    import CollectPayment from '@src/components/collect-payment'
    import axios from 'axios'

    /**
     * Starter component
     */
    export default {
        page: {
            title: 'Point of Sales',
            meta: [{name: 'description', content: appConfig.description}],
        },
        components: {Layout, CollectPayment},
        data() {
            return {
                pendingOrders: [],
                items: [],
                destinations: [],
                currentTab: 'items',
                searchQuery: null,
                loading: true,
                selectedOrderIndex: null,
                orderPaymentState: 'initialize',
                orderPaymentDisabled: false,
                errors: [],
                success: [],
                newOrder: {
                    items: [],
                    destination: 'Dining Hall/Garden',
                    total: null,
                }
            }
        },
        computed: {
            filteredItemsList: function () {
                return this.items.filter((e) => {
                    if (this.searchQuery !== null) {
                        return e.name.toLowerCase().includes(this.searchQuery.toLowerCase())
                    }
                    return true
                })
            },
            pendingOrdersCount: function () {
                return this.pendingOrders.length
            },
            newOrderTotal: function () {
                let total = 0
                this.newOrder.items.forEach((e) => {
                    total += e.subTotal
                })
                return total
            }
        },

        watch: {
            'newOrder.items': {
                deep: true,
                handler: function (val) {
                    this.newOrder.total = 0
                    this.newOrder.items.forEach((e) => {
                        this.newOrder.total += e.subTotal
                    })
                }
            }
        },

        mounted: function () {
            this.getData()
        },

        methods: {
            getData: async function () {
                this.loading = true
                let ordersObj = await axios.get('http://localhost:3000/pendingorders')
                this.pendingOrders = ordersObj.data
                let itemsObj = await axios.get('http://localhost:3000/items')
                this.items = itemsObj.data
                this.destinations = ['Dining Hall/Garden', 'Room 302', 'Room 708']
                setTimeout(() => {
                    this.loading = false
                }, 1000)
            },
            placeOrder: async function(){
                let ordersObj = await axios.get('http://localhost:3000/pendingorders')
                this.pendingOrders = ordersObj.data
                console.log(this.pendingOrders)
                this.pendingOrders.push({
                    id: 35,
                    items: []
                })
                console.log(this.pendingOrders.length)
                this.success.push('Order Placed Successfully')
                this.newOrder.items = []
                this.newOrder.destination = 'Dining Hall/Garden'
            },

            createNewItem: function () {
                console.log("New Item Created")
            },
            showOrderFulfillmentModal: function (orderIndex) {
                this.selectedOrderIndex = orderIndex
                this.$bvModal.show('order-fulfilled-modal')
            },
            cancelOrder: function (orderIndex) {
                console.log("Order cancelled")
            },
            processOrderPayment: function(paymentInfo){
                console.log("Hello")
                this.orderPaymentState = 'loading'
                setTimeout(() => {
                    this.orderPaymentState = 'success'
                    this.orderPaymentDisabled = true
                    this.pendingOrders.splice(this.selectedOrderIndex, 1)
                    this.selectedOrderIndex = null
                }, 1500)
            },
            resetOrderPaymentState: function(){
                this.orderPaymentState = 'initialize'
                this.orderPaymentDisabled = false
            },

            addItemToNewOrder: function (index) {
                this.success = []
                this.errors = []
                let item = this.items[index]
                item.quantity = 1
                item.subTotal = item.quantity * item.pricePerUnit
                this.newOrder.items.push(item)
            },

            incrementItemQuantityInNewOrder: function (index) {
                let item = this.newOrder.items[index]
                item.quantity += 1
                item.subTotal = item.quantity * item.pricePerUnit
                this.newOrder.items[index] = item
            },
            decrementItemQuantityInNewOrder: function (index) {
                let item = this.newOrder.items[index]
                item.quantity -= 1
                if (item.quantity === 0) {
                    item.quantity = 1
                }
                item.subTotal = item.quantity * item.pricePerUnit
                this.newOrder.items[index] = item
            },
            removeItemFromNewOrder: function (index) {
                this.newOrder.items.splice(index, 1)
            },
        }
    }
</script>

<template>
    <Layout>
        <b-nav tabs justified class="mt-5">

            <b-nav-item :active="currentTab === 'items'" @click="currentTab = 'items'">
                <h5 :class="currentTab === 'items' ? 'font-weight-bold' : 'font-weight-normal'">Place an Order</h5>
            </b-nav-item>
            <b-nav-item :active="currentTab === 'pending'" @click="currentTab = 'pending'">
                <h5 :class="currentTab === 'pending' ? 'font-weight-bold' : 'font-weight-normal'">Pending Orders
                    <b-badge v-if="pendingOrdersCount > 0" variant="danger">{{ pendingOrdersCount }}</b-badge>
                </h5>
            </b-nav-item>

        </b-nav>

        <div class="mt-3">
            <b-alert v-for="error in errors" :key="error" variant="danger" show="5" dismissible>
                <feather type="alert-triangle" class="align-middle mr-1"></feather>
                <span class="align-middle">{{ error }}</span>
            </b-alert>

            <b-alert v-for="message in success" :key="message" variant="success" show="10" dismissible>
                <feather type="check" class="align-middle mr-1"></feather>
                <span class="align-middle">{{ message }}</span>
            </b-alert>
        </div>

        <div v-if="loading" class="text-center mt-5">
            <b-spinner variant="primary" label="Spinning"></b-spinner>
        </div>
        <div v-else-if="currentTab === 'items'" class="row mt-5">
            <div class="col-12 col-lg-5">
                <div class="card">
                    <div class="card-body">
                        <table v-if="newOrder.items.length > 0" class="table table-borderless table-responsive table-hover">
                            <thead>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Sub-Total</th>
                            </thead>

                            <tbody >
                            <tr :key="index" v-for="(item, index) in newOrder.items">
                                <td>{{ item.name }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>{{ item.subTotal }}</td>
                                <td>
                                    <a href="#" class="p-0 pr-lg-2" v-b-tooltip.hover title="Increase quantity by 1"
                                       @click.prevent.stop="incrementItemQuantityInNewOrder(index)">
                                        <feather type="plus-circle"></feather>
                                    </a>
                                    <a href="#" class="p-0 pr-lg-2" v-b-tooltip.hover title="Decrease quantity by 1"
                                       @click.prevent.stop="decrementItemQuantityInNewOrder(index)">
                                        <feather type="minus-circle"></feather>
                                    </a>
                                    <a href="#" class="p-0 pr-lg-2" v-b-tooltip.hover title="Remove item from list"
                                       @click.prevent.stop="removeItemFromNewOrder(index)">
                                        <feather type="x-circle"></feather>
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td class="font-weight-bold">Total:</td>
                                <td></td>
                                <td class="font-weight-bold">{{ newOrder.total }}</td>
                            </tr>

                            </tbody>

                            <div class="form-group mt-2 pl-2">
                                <label class="font-weight-bold">Select Destination:</label>
                                <select class="form-control" v-model="newOrder.destination">
                                    <option :key="destination" v-for="destination in destinations" :value="destination">{{destination}}</option>
                                </select>

                            </div>
                            <button class="btn btn-primary ml-2" @click.prevent.stop="placeOrder">Place Order</button>

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
                        <input
                                type="text"
                                class="form-control"
                                placeholder="Search..."
                                v-model="searchQuery"
                        />
                    </div>
                    <a :key="index" v-for="(item, index) in filteredItemsList"
                       @click.stop.prevent="addItemToNewOrder(index)" href="#" class="text-center col-6 col-lg-3">
                        <b-card bg-variant="white" text-variant="dark" class="border border-primary">
                            <b-card-text class="px-1 py-3 text-wrap">{{ item.name }} <br> {{ item.pricePerUnit }}
                            </b-card-text>
                        </b-card>
                    </a>
                    <a href="#" class="text-center col-6 col-lg-3" @click.prevent.stop="createNewItem">
                        <b-card bg-variant="primary" text-variant="white" class="border border-primary">
                            <b-card-text class="px-1 text-wrap"> Cannot find Item ? <br>
                                <feather type="plus"></feather>
                            </b-card-text>
                        </b-card>
                    </a>
                </div>
            </div>
        </div>
        <div v-else-if="currentTab === 'pending'" class="mt-5">
           <div class="orders card" v-for="(order, index) in pendingOrders" :key="index">
               <div class="card-body">
                   <div class="table-responsive">
                       <table class="table table-borderless">
                           <thead>
                               <th>Date</th>
                               <th>Items</th>
                               <th>Order Total</th>
                               <th>Destination</th>
                               <th>Department</th>
                           </thead>
                           <tbody>
                           <tr>
                               <td>March 24th, 2020</td>
                               <td>
                                   <table class="table-hover">
                                       <thead class="font-italic font-weight-lighter">
                                        <th>Name</th>
                                        <th>Quantity</th>
                                        <th>Subtotal</th>
                                       </thead>
                                       <tbody>
                                           <tr v-for="(item, itemIndex) in order.items" :key="itemIndex">
                                               <td>{{item.name}}</td>
                                               <td>{{item.quantity}}</td>
                                               <td>{{ item.quantity * item.pricePerUnit }}</td>
                                           </tr>
                                       </tbody>
                                   </table>
                               </td>
                               <td>{{ order.amountDue }}</td>
                               <td>{{ order.destination }}</td>
                               <td>Kitchen</td>
                           </tr>

                           </tbody>
                       </table>
                   </div>
                    <div class="float-right">
                        <b-button variant="primary" class="mx-3" @click.prevent.stop="showOrderFulfillmentModal(index)">
                            <feather type="check" class="align-middle"></feather>
                            <span class="align-middle">Mark as Fulfilled</span>
                        </b-button>
                        <b-button variant="danger" @click.prevent.stop="cancelOrder(index)">
                            <feather type="x" class="align-middle"></feather>
                            <span class="align-middle">Cancel</span>
                        </b-button>
                    </div>
               </div>
           </div>
        </div>

        <b-modal id="order-fulfilled-modal" @show="resetOrderPaymentState" size="lg" hide-footer header-bg-variant="dark" title="Add Payment for Order">
            <CollectPayment :disabled="orderPaymentDisabled" :state="orderPaymentState" takeCredit @submit-payment="processOrderPayment"></CollectPayment>
        </b-modal>
    </Layout>
</template>
<style scoped>
    .orders.table{
        width: 100%
    }
</style>