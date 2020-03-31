<script>
    import appConfig from '@src/app.config'
    import Layout from '@layouts/main'
    import { DateTime } from 'luxon'
    import StateButton from "../../../../components/state-button";
    import SuccessFailureAlert from "../../../../components/success-failure-alert";
    import axios from 'axios'
    import JsonExcel from 'vue-json-excel'

    /**
     * Starter component
     */
    export default {
        page: {
            title: 'Bookings',
            meta: [{name: 'description', content: appConfig.description}],
        },
        components: {
            SuccessFailureAlert,
            StateButton,
            Layout,
            JsonExcel
        },
        data() {
            return {
                bookings: [],
                bookingFields: [
                    {key: 'SN', label: 'S/N', sortable: false, sortDirection: 'desc'},
                    {key: 'roomDetails', label: 'Room Details', sortable: true, sortDirection: 'desc'},
                    {key: 'startDate', label: 'Booking Opened on', sortable: true, sortDirection: 'desc'},
                    {key: 'endDate', label: 'Booking Ended on', sortable: true, sortDirection: 'desc'},
                    {key: 'pricePerNight', label: 'Price per Night', sortable: true, sortDirection: 'desc'},
                    {key: 'totalDue', label: 'Total Due', sortable: true, sortDirection: 'desc'},
                    {key: 'status', label: 'Booking Status', sortable: true, sortDirection: 'desc'}
                ],
                bookingExcelFields: {
                  'Start Date': 'startDate',
                  'End Date': 'endDate',
                  'Room Details': 'roomDetails',
                  'Price Per Night': 'pricePerNight',
                  'Total Due': 'totalDue',
                  'Status': 'status'
                },
                totalRows: 1,
                currentPage: 1,
                perPage: 25,
                pageOptions: [10, 25, 50, 100],
                filter: null,
                filterOn: [],
                sortBy: 'age',
                sortDesc: false,
                loading: false,
                filterBtn: {
                    title: 'Filter',
                    icon: 'none',
                    disabled: false,
                    variant: 'primary',
                    loading: false
                },
                fromDate: null,
                toDate: null,
                selectedStatus: null,
                success: [],
                errors: []
            }
        },
        computed: {
            rows: function(){
                return this.bookings.length
            },
            today: function(){
                return DateTime.local().toLocaleString(DateTime.DATE_HUGE)
            }
        },
        mounted: function () {
            this.loading = true
            setTimeout(() => {
                this.getData()
            }, 1500)
        },
        methods: {
            filterBookings: function(){
                if(this.isFilterByDateValid()){
                    this.loading = true
                    this.filterBtn.loading = true
                    setTimeout(() => {
                        this.getData()
                        this.filterBtn.loading = false
                    }, 1000)

                }
            },
            isFilterByDateValid: function(){
                if(this.toDate === null || this.fromDate === null){
                    this.errors.push('Please select a FROM and TO date')
                    return false
                }

                if(DateTime.fromISO(this.toDate) >= DateTime.local()){
                    this.errors.push('You cannot get results for a day after today')
                    return false
                }

                if(DateTime.fromISO(this.fromDate) > DateTime.fromISO(this.toDate)){
                    this.errors.push('The FROM date must be a day before the TO date')
                    return false
                }
                return true
            },
            getData: async function(){
                let history = await axios.get('http://localhost:3000/bookings')
                this.bookings = history.data
                this.loading = false
            }
        }
    }
</script>

<template>
    <Layout>
        <div class="mt-4">
            <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
            <div class="row mt-4">
                <div class="form-group col-12 col-lg-3">
                    <label class="font-weight-bold">
                        From
                    </label>
                    <input type="date" class="form-control" v-model="fromDate"/>
                </div>

                <div class="form-group col-12 col-lg-3">
                    <label class="font-weight-bold">
                        To:
                    </label>
                    <input type="date" class="form-control" v-model="toDate"/>
                </div>
                <div class="form-group col-12 col-lg-3">
                    <label class="font-weight-bold">
                        Status:
                    </label>
                    <select class="form-control" v-model="selectedStatus">
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
                <div class="col-12 col-lg-3 mt-1">
                    <StateButton :buttonState="filterBtn" class="px-5 mt-4" @clicked="filterBookings"></StateButton>
                </div>

            </div>

            <div class="card mt-2">
                <div class="card-body">
                    <div v-if="loading">
                        <div class="text-center my-5">
                            <b-spinner variant="primary" label="Spinning" class="p-5"></b-spinner>
                        </div>
                    </div>
                    <div v-else>
                        <div class="row mb-md-4">
                            <div class="col-sm-12 col-md-6">
                                <div class="dataTables_length">
                                    <label class="d-inline-flex align-items-center">
                                        Show&nbsp;
                                        <b-form-select
                                                v-model="perPage"
                                                size="sm"
                                                :options="pageOptions"
                                        ></b-form-select
                                        >&nbsp;entries
                                    </label>
                                </div>
                            </div>
                            <!-- Search -->
                            <div class="col-sm-12 col-md-6">
                                <div
                                        class="dataTables_filter text-md-right"
                                >
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
                        <div class="row mb-3">

                            <h3 class="col-12 col-lg-7">Room Booking History from <span class="text-info">March 1st, 2020</span> to <span class="text-info">{{ today }}</span></h3>

                            <div class="col-12 col-lg-5 text-right">
                                <JsonExcel class="btn btn-dark mb-1" :data="bookings" :fields="bookingExcelFields" worksheet="Rikon Bookings" name="rikon-booking-history.xls">
                                    <i class="uil uil-chart-line mr-3"></i> Export to Excel
                                </JsonExcel>
                            </div>

                        </div>
                        <div v-show="true" class="table-responsive  table-hover mb-0">
                            <b-table
                                    :items="bookings"
                                    :fields="bookingFields"
                                    responsive="sm"
                                    :per-page="perPage"
                                    :current-page="currentPage"
                                    :sort-by.sync="sortBy"
                                    :sort-desc.sync="sortDesc"
                                    :filter="filter"
                                    :filter-included-fields="filterOn"
                            >

                                <template v-slot:cell(SN)="row">
                                    {{ row.index + 1 }}
                                </template>

                                <template v-slot:cell(endDate)="row">
                                    <span v-if="row.item.endDate === null">Booking is still open</span>
                                    <span v-else>{{row.item.endDate}}</span>
                                </template>

                            </b-table>
                        </div>
                        <div class="row">
                            <div class="col">
                                <div
                                        class="dataTables_paginate paging_simple_numbers float-right"
                                >
                                    <ul class="pagination pagination-rounded mb-0">
                                        <!-- pagination -->
                                        <b-pagination
                                                v-model="currentPage"
                                                :total-rows="rows"
                                                :per-page="perPage"
                                        ></b-pagination>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </Layout>
</template>
