<script>
    import appConfig from '@src/app.config'
    import Layout from '@layouts/main'
    import { DateTime } from 'luxon'
    import StateButton from "../../../../components/state-button";
    import SuccessFailureAlert from "../../../../components/success-failure-alert";
    import axios from 'axios'
    import ResolveQuery from "./components/resolve-query";

    /**
     * Starter component
     */
    export default {
        page: {
            title: 'Store Queries',
            meta: [{name: 'description', content: appConfig.description}],
        },
        components: {
            ResolveQuery,
            SuccessFailureAlert,
            StateButton,
            Layout
        },
        data() {
            return {
                queries: [],
                pendingQueries: [],
                queryFields: [
                    {key: 'SN', label: 'S/N', sortable: false, sortDirection: 'desc'},
                    {key: 'id', label: 'Id', sortable: true, sortDirection: 'desc'},
                    {key: 'expectedQuantity', label: 'Expected Quantity', sortable: true, sortDirection: 'desc'},
                    {key: 'actualQuantity', label: 'Actual Quantity In Stock', sortable: true, sortDirection: 'desc'},
                    {key: 'date', label: 'Date Opened', sortable: true, sortDirection: 'desc'},
                    {key: 'date', label: 'Date Closed', sortable: true, sortDirection: 'desc'},
                ],
                pendingQueryFields: [
                    {key: 'SN', label: 'S/N', sortable: false, sortDirection: 'desc'},
                    {key: 'id', label: 'Id', sortable: true, sortDirection: 'desc'},
                    {key: 'expectedQuantity', label: 'Expected Quantity', sortable: true, sortDirection: 'desc'},
                    {key: 'actualQuantity', label: 'Actual Quantity In Stock', sortable: true, sortDirection: 'desc'},
                    {key: 'date', label: 'Date Opened', sortable: true, sortDirection: 'desc'},
                    {key: 'status', label: 'Status', sortable: true, sortDirection: 'desc'},
                    {key: 'actions', label: 'Actions', sortable: true, sortDirection: 'desc'}
                ],
                totalRows: 1,
                currentPage: 1,
                perPage: 25,
                pageOptions: [10, 25, 50, 100],
                filter: null,
                filterOn: [],
                sortBy: 'age',
                sortDesc: false,
                selectedQuery: {
                    expectedQuantity: null,
                    actualQuantity: null,
                    item: {
                        name: null
                    }
                },
                loading: false,
                tabs: ['Pending', 'Query History'],
                currentTab: 'Pending',
                filterBtn: {
                    title: 'Filter',
                    icon: 'none',
                    disabled: false,
                    variant: 'primary',
                    loading: false
                },
                fromDate: null,
                toDate: null,
                success: [],
                errors: []
            }
        },
        computed: {
            rows: function(){
                return this.queries.length
            },
            pendingQueriesRows: function(){
                return this.pendingQueries.length
            },
        },
        mounted: function () {
            this.loading = true
            this.getQueries()
        },
        methods: {
            filterHistoryByDate: function(){
                if(this.isFilterByDateValid()){
                    this.loading = true
                    this.filterBtn.loading = true
                    setTimeout(() => {
                        this.getQueries()
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
            getQueries: async function(){
                let history = await axios.get('http://localhost:3000/queries')
                this.queries = history.data
                this.pendingQueries = history.data
                this.loading = false
            },
            showResolveQueryModal: function(selectedQuery){
                this.selectedQuery = selectedQuery
                this.$bvModal.show('resolve-query')
            }
        }
    }
</script>

<template>
    <Layout>
        <div class="mt-4">
            <b-nav tabs justified>
                <b-nav-item v-for="tab in tabs" :key="tab" :active="currentTab === tab " @click="currentTab = tab">
                    <h5 :class="currentTab === tab ? 'font-weight-bold' : 'font-weight-normal'">{{ tab[0].toUpperCase()
                        + tab.slice(1)}}</h5>
                </b-nav-item>
            </b-nav>
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
                <div class="col-12 col-lg-3 mt-1">
                    <StateButton :buttonState="filterBtn" class="px-5 mt-4" @clicked="filterHistoryByDate"></StateButton>
                </div>

            </div>

            <div class="card">
                <div class="card-body">
                    <div v-if="loading">
                        <div class="text-center my-5">
                            <b-spinner variant="primary" label="Spinning" class="p-5"></b-spinner>
                        </div>
                    </div>
                    <div v-else-if="currentTab === 'Pending'">
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
                        <div v-show="true" class="table-responsive  table-hover mb-0">
                            <b-table
                                    :items="pendingQueries"
                                    :fields="pendingQueryFields"
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

                                <template v-slot:cell(actions)="row">
                                    <a class="badge badge-primary text-white mx-1" href="#" @click.stop.prevent="showResolveQueryModal(row.item)">Resolve Query</a>
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
                                                :total-rows="pendingQueriesRows"
                                                :per-page="perPage"
                                        ></b-pagination>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="currentTab === 'Query History'">
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
                        <div v-show="true" class="table-responsive  table-hover mb-0">
                            <b-table
                                    :items="queries"
                                    :fields="queryFields"
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

        <b-modal id="resolve-query" size="xl" hide-footer header-bg-variant="dark" title="Resolve Query">
            <ResolveQuery :query="selectedQuery"></ResolveQuery>
        </b-modal>

    </Layout>
</template>
