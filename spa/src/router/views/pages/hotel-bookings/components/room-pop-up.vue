<script>
    import {DateTime, Interval} from 'luxon'
    import StateButton from '@src/components/state-button'
    import CollectCashPayment from '@src/components/collect-cash-payment'
    import CollectPayment from '@src/components/collect-payment'

    import axios from 'axios'

    export default {
        name: "room-pop",
        components: {StateButton, CollectCashPayment, CollectPayment},
        props: {
            room: {
                type: Object,
                required: true
            }
        },
        data: function () {
            return {
                roomDetails: {
                    room: this.room,
                    reservation: null,
                    booking: null,
                    currentBooking: null,
                    reservations: null
                },
                errors: [],
                success: [],
                tabs: ['upcoming reservations'],
                currentTab: 'loading',
                newReservation: {
                    customerName: "",
                    customerPhone: "",
                    reservationStart: DateTime.local(),
                    reservationEnd: DateTime.local(),
                    validationMessage: null
                },
                buttons: {
                    bookBtn: {
                        title: `Book ${this.room.type.toUpperCase()} ${this.room.room_no}`,
                        icon: "none",
                        disabled: false,
                        variant: "dark",
                        loading: false
                    },
                    savePaymentBtn: {
                        state: 'initialize',
                        disabled: false
                    },
                    createReservationBtn: {
                        variant: "primary",
                        disabled: false,
                        loading: false,
                        title: "Create Reservation",
                        icon: "none"
                    },
                    closeReservationBtn: {
                        variant: "primary",
                        disabled: false,
                        loading: false,
                        title: "Close Reservation",
                        icon: "none"
                    }
                }
            }
        },
        computed: {
            currentDate: function () {
                console.log(DateTime.local().toISO())
                return DateTime.local().toISODate()
            },
            bookingStartDate: function () {
                if (this.roomDetails.booking) {
                    return DateTime.fromISO(this.roomDetails.booking.startDate).toLocaleString(DateTime.DATE_FULL)
                }
                return ""
            },
            newReservationNights: function () {
                let nights = Interval.fromDateTimes(DateTime.fromISO(this.newReservation.reservationStart), DateTime.fromISO(this.newReservation.reservationEnd)).length('days').toFixed(0)
                return isNaN(nights) ? 0 : nights
            }
        },
        mounted: function () {
            this.currentTab = 'loading'
            this.getReservations()
            this.getReservation()
            this.getBooking()
            setTimeout(() => {
                console.log("hello")
                this.currentTab = this.tabs[0]
            }, 1900)
            if (this.room.status === 'reserved') {
                this.tabs.unshift('current reservation')
            }
            if (this.room.status === 'available') {
                this.tabs.unshift('book room')
            }
            if (this.room.status === 'booked') {
                this.tabs.unshift('booking')
            }

        },
        methods: {
            bookRoom: function () {
                this.buttons.bookBtn.loading = true
                setTimeout(() => {
                    this.roomDetails.currentBooking = {
                        bookingId: 20,
                        roomId: 100,
                        startDate: "2020-03-10T11:26:51.416+01:00",
                        costPerNight: "5000",
                        amountPaid: 0
                    }
                    this.buttons.bookBtn.loading = false
                    this.buttons.bookBtn.icon = "check-circle"
                    this.buttons.bookBtn.title = "Successfully Booked Room ".concat(this.room.room_no)
                    this.buttons.bookBtn.variant = "success"
                    this.buttons.bookBtn.disabled = true
                    this.success.push('Successfully Booked Room '.concat(this.room.room_no))
                    this.$emit('update-room-status')
                }, 2000)
            },
            closeBooking: function(){
                console.log('close booking')
            },

            savePayment: function (paymentDetails) {
                this.buttons.savePaymentBtn.state = 'loading'
                setTimeout(() => {
                    console.log(paymentDetails)
                    this.roomDetails.booking.amountPaid += paymentDetails.amount
                    this.buttons.savePaymentBtn.state = 'success'
                    this.buttons.savePaymentBtn.disabled = true
                    this.success.push('Successfully paid N'.concat(paymentDetails.amount))
                }, 1500)
            },

            saveBookingPayment: function(paymentDetails){
                console.log('save payment from '.concat(paymentDetails.type))
            },

            getReservations: async function () {
                let reservationsData = await axios.get('http://localhost:3000/reservations')
                let reservations = reservationsData.data.reservations
                reservations.forEach(function (e) {
                    e.friendlyStartDate = DateTime.fromISO(e.startDate).toLocaleString(DateTime.DATE_HUGE)
                    e.friendlyEndDate = DateTime.fromISO(e.endDate).toLocaleString(DateTime.DATE_HUGE)
                    e.expiresIn = Interval.fromDateTimes(DateTime.local(), DateTime.fromISO(e.startDate)).length('days').toFixed(0)
                })
                this.roomDetails.reservations = reservations
            },

            getReservation: async function () {
                let reservationData = await axios.get('http://localhost:3000/reservation')
                let reservation = reservationData.data
                reservation.friendlyStartDate = DateTime.fromISO(reservation.startDate).toLocaleString(DateTime.DATE_HUGE)
                reservation.friendlyEndDate = DateTime.fromISO(reservation.endDate).toLocaleString(DateTime.DATE_HUGE)
                let expiresIn = Interval.fromDateTimes(DateTime.local(), DateTime.fromISO(reservation.startDate)).length('hours').toFixed(0)
                reservation.expiresIn = isNaN(expiresIn) ? 'Already Expired' : expiresIn.concat(' hours')
                console.log(reservation)
                this.roomDetails.reservation = reservation
            },

            getBooking: function () {
                this.roomDetails.booking = {
                    bookingId: 20,
                    roomId: 100,
                    startDate: "2020-03-10T11:26:51.416+01:00",
                    costPerNight: "5000",
                    amountPaid: 0
                }
            },

            closeReservation: function () {
                this.buttons.closeReservationBtn.loading = true
                setTimeout(() => {
                    this.success.push('Successfully closed reservation')
                    this.buttons.closeReservationBtn.loading = false
                    this.buttons.closeReservationBtn.disabled = true
                    this.buttons.closeReservationBtn.variant = "success"
                    this.buttons.closeReservationBtn.title = "Successfully closed reservation"
                    this.buttons.closeReservationBtn.icon = "check"
                    this.$emit('update-room-status')
                }, 2000)
            },

            createNewReservation: function () {
                console.log("hello")
                if (this.validateReservationForm()) {
                    this.buttons.createReservationBtn.loading = true
                    setTimeout(() => {
                        console.log(this.newReservation)
                        this.buttons.createReservationBtn.variant = "success"
                        this.buttons.createReservationBtn.disabled = true
                        this.buttons.createReservationBtn.icon = "check"
                        this.buttons.createReservationBtn.loading = false
                        this.buttons.createReservationBtn.title = "Successfully reserved ".concat(this.room.room_no)
                        this.success.push('Successfully reserved room '.concat(this.room.room_no))
                    }, 2000)
                }
            },

            validateReservationForm: function () {
                if (DateTime.local() >= DateTime.fromISO(this.newReservation.reservationStart)) {
                    this.newReservation.validationMessage = "You cannot create a reservation for today or a day before today"
                    return false
                }

                if (DateTime.fromISO(this.newReservation.reservationStart) > DateTime.fromISO(this.newReservation.reservationEnd)) {
                    this.newReservation.validationMessage = "The reservation cannot end before it starts"
                    return false
                }

                if (this.newReservation.customerName.length < 1) {
                    this.newReservation.validationMessage = "The customer name is required"
                    return false
                }

                if (this.newReservation.customerPhone.length !== 11) {
                    this.newReservation.validationMessage = "Please enter a valid 11 digit phone number"
                    return false
                }

                return true
            }
        }

    }
</script>
<template>
    <div>


        <b-nav tabs justified>
            <b-nav-item v-for="tab in tabs" :key="tab" :active="currentTab === tab " @click="currentTab = tab">
                <h5 :class="currentTab === tab ? 'font-weight-bold' : 'font-weight-normal'">{{ tab[0].toUpperCase() +
                    tab.slice(1)}}</h5>
            </b-nav-item>
        </b-nav>

        <div class="mt-3">
            <b-alert v-for="error in errors" :key="error" variant="danger" show dismissible>
                <feather type="alert-triangle" class="align-middle mr-1"></feather>
                <span class="align-middle">{{ error }}</span>
            </b-alert>

            <b-alert v-for="message in success" :key="message" variant="success" show dismissible>
                <feather type="check" class="align-middle mr-1"></feather>
                <span class="align-middle">{{ message }}</span>
            </b-alert>
        </div>

        <div class="text-center m-5" v-if="currentTab === 'loading'">
            <b-spinner variant="primary" label="Spinning"></b-spinner>
        </div>


        <div v-else-if="currentTab === 'book room'">
            <div class="text-center">

                <StateButton :buttonState="buttons.bookBtn" @clicked="bookRoom"></StateButton>
                <div v-if="roomDetails.currentBooking !== null" class="row">
                    <div class="col-12 col-lg-6 mt-4">
                        <b-card-header>
                            Booking Details
                        </b-card-header>
                        <b-card-body class="text-left">
                            <table class="table table-responsive table-hover">
                                <tbody>
                                <tr>
                                    <td class="font-weight-semibold">Start Date:</td>
                                    <td> {{ bookingStartDate }}</td>
                                </tr>
                                <tr>
                                    <td class="font-weight-semibold">Cost per night:</td>
                                    <td> {{ roomDetails.booking.costPerNight }}</td>
                                </tr>
                                <tr>
                                    <td class="font-weight-semibold">Amount Paid(N):</td>
                                    <td> {{ roomDetails.booking.amountPaid }}</td>
                                </tr>
                                </tbody>
                            </table>
                        </b-card-body>
                    </div>
                    <CollectCashPayment :state="buttons.savePaymentBtn.state" :disabled="buttons.savePaymentBtn.disabled"
                                        class="col-12 col-lg-6" @clicked="savePayment"></CollectCashPayment>
                </div>


            </div>


        </div>
        <div v-else-if="currentTab === 'upcoming reservations'">
            <div class="row">
                <div class="col-12 col-lg-6">
                    <h4 class="mb-3">Upcoming reservations</h4>
                    <table class="table table-responsive table-hover">
                        <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Reservation starts</th>
                            <th>Reservation ends</th>
                            <th>Reservation expires in</th>
                        </tr>
                        </thead>
                        <p v-if="roomDetails.reservations === null" class="pl-3">
                            There are currently no upcoming reservations for this room
                        </p>
                        <tbody v-else>
                        <tr v-for="reservation in roomDetails.reservations" :key="reservation.id">
                            <td>{{ reservation.customerName }}</td>
                            <td>{{ reservation.friendlyStartDate }}</td>
                            <td>{{ reservation.friendlyEndDate }}</td>
                            <td>{{ reservation.expiresIn }} days from now</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div class="col-12 col-lg-6">
                    <h4 class="mb-3">Create a new reservation</h4>
                    <span class="text-danger" v-if="newReservation.validationMessage !== null">*Error: {{
                        newReservation.validationMessage }}</span>
                    <div class="form-group">
                        <label for="customerName">Customer Name: </label>
                        <input type="text" class="form-control" id="customerName"
                               v-model="newReservation.customerName"/>
                    </div>
                    <div class="form-group">
                        <label for="customerPhone">Phone Number: </label>
                        <input type="text" class="form-control" id="customerPhone"
                               v-model="newReservation.customerPhone"/>
                    </div>
                    <div class="form-group">
                        <label for="reservationStartDate">Reservation Starts: </label>
                        <input type="date" class="form-control" id="reservationStartDate"
                               v-model="newReservation.reservationStart"/>
                    </div>
                    <div class="form-group">
                        <label for="reservationEndDate">Reservation Ends: </label>
                        <input type="date" class="form-control" id="reservationEndDate"
                               v-model="newReservation.reservationEnd"/>
                    </div>
                    <div class="form-group">
                        <label for="reservationNights">Number of Nights: </label>
                        <input readonly type="text" class="form-control bg-info" id="reservationNIghts"
                               :value="newReservationNights"/>
                    </div>
                    <StateButton :buttonState="buttons.createReservationBtn"
                                 @clicked="createNewReservation"></StateButton>
                </div>
            </div>

        </div>
        <div v-else-if="currentTab === 'booking'">
            <div class="row">
                <div class="col-12 col-lg-6">
                    <b-card-header>
                        Booking Details
                    </b-card-header>
                    <b-card-body class="text-left">
                        <table class="table table-responsive table-hover">
                            <tbody>
                            <tr>
                                <td class="font-weight-semibold">Start Date:</td>
                                <td> {{ bookingStartDate }}</td>
                            </tr>
                            <tr>
                                <td class="font-weight-semibold">Close Date (i.e Today):</td>
                                <td> March 24th, 2020</td>
                            </tr>
                            <tr>
                                <td class="font-weight-semibold">Cost per night:</td>
                                <td> {{ roomDetails.booking.costPerNight }}</td>
                            </tr>
                            <tr>
                                <td class="font-weight-semibold">Amount Paid(N):</td>
                                <td> {{ roomDetails.booking.amountPaid }}</td>
                            </tr>
                            <tr>
                                <td class="font-weight-semibold">Total due:</td>
                                <td> 7000 </td>
                            </tr>
                            <tr>
                                <td class="font-weight-semibold">Number of nights: </td>
                                <td> 3 </td>
                            </tr>
                            </tbody>
                        </table>


                    </b-card-body>
                    <div class="row text-center">
                        <div class="col-12">
                            <b-button @click="closeBooking">Close Booking</b-button>
                        </div>
                    </div>
                </div>
                <CollectPayment take-credit class="col-12 col-lg-5 ml-3" @submit-payment="saveBookingPayment"></CollectPayment>
            </div>



        </div>
        <div v-else-if="currentTab === 'current reservation'">
            <div>
                <b-card-header class="font-weight-semibold">
                    Reservation Details
                </b-card-header>
                <b-card-body class="text-left">
                    <table class="table table-borderless table-hover">
                        <tbody>
                        <tr>
                            <td class="font-weight-semibold">Customer Name:</td>
                            <td> {{ roomDetails.reservation.customerName }}</td>
                        </tr>
                        <tr>
                            <td class="font-weight-semibold">Start Date:</td>
                            <td> {{ roomDetails.reservation.friendlyStartDate }}</td>
                        </tr>

                        <tr>
                            <td class="font-weight-semibold">End Date:</td>
                            <td> {{ roomDetails.reservation.friendlyEndDate }}</td>
                        </tr>
                        <tr>
                            <td class="font-weight-semibold">Expires in:</td>
                            <td> {{ roomDetails.reservation.expiresIn }}</td>
                        </tr>
                        </tbody>
                    </table>
                </b-card-body>
            </div>

            <div class="text-center">
                <StateButton :buttonState="buttons.closeReservationBtn" @clicked="closeReservation"></StateButton>
            </div>

        </div>
    </div>


</template>

<style scoped>

</style>