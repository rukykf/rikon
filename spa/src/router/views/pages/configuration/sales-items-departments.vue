<script>
    import appConfig from '@src/app.config'
    import Layout from '@layouts/main'
    import axios from 'axios'
    import SuccessFailureAlert from '@components/success-failure-alert'
    import SaveSalesItem from "../../../../components/save-sales-item";
    import SaveDepartment from "../../../../components/save-department";

    export default {
        page: {
            title: 'Sales Items & Departments',
            meta: [{name: 'description', content: appConfig.description}],
        },
        components: {
            SaveDepartment,
            SaveSalesItem,
            SuccessFailureAlert,
            Layout
        },
        data: function(){
            return {
                tabs: ['Sales Items', 'Departments'],
                currentTab: 'Sales Items',
                errors: [],
                success: [],
                loading: false,
                salesItems: [],
                departments: [],
                salesItemFields: [
                    {key: 'SN', label: 'S/N', sortable: false},
                    {key: 'name', label: 'Item Name', sortable: true, sortDirection: 'desc'},
                    {key: 'unit', label: 'Unit of Measurement', sortable: true, sortDirection: 'desc'},
                    {key: 'pricePerUnit', label: 'Price per Unit(N)', sortable: true, sortDirection: 'desc'},
                    {key: 'department', label: 'Department', sortable: true, sortDirection: 'desc'},
                    {key: 'actions', label: 'Actions', sortable: false, sortDirection: 'desc'}
                ],
                selectedSalesItem: {
                    id: null,
                    name: null,
                    unit: null,
                    pricePerUnit: null,
                    department: null
                },
                selectedDepartment: {
                    id: null,
                    name: null,
                    permissions: null
                },
                totalRows: 1,
                currentPage: 1,
                perPage: 25,
                pageOptions: [10, 25, 50, 100],
                filter: null,
                filterOn: [],
                sortBy: 'age',
                sortDesc: false,
            }
        },
        computed: {
            salesItemsRows: function(){
                return this.salesItems.length
            }
        },
        mounted: function(){
            this.getData()
        },
        methods: {
            getData: async function(){
                this.loading = true
                let salesItemsData = await axios.get('http://localhost:3000/salesItems')
                let departmentsData = await axios.get('http://localhost:3000/departments')
                this.salesItems = salesItemsData.data
                this.departments = departmentsData.data
                setTimeout(() => {
                    this.loading = false
                }, 1500)
            },

            showEditSalesItemModal: function(selectedSalesItem){
                this.selectedSalesItem = selectedSalesItem
                this.$bvModal.show('save-sales-item')
            },
            showEditDepartmentModal: function(selectedDepartment){
                this.selectedDepartment = selectedDepartment
                this.$bvModal.show('save-department')
            },
            showAddSalesItemModal: function(){
                this.$bvModal.show('add-sales-item')
            },
            showAddDepartmentModal: function(){
                this.$bvModal.show('add-department')
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

            <div class="card mt-3">
                <div class="card-body">
                    <div v-if="loading">
                        <div class="text-center my-5">
                            <b-spinner variant="primary" label="Spinning" class="p-5"></b-spinner>
                        </div>
                    </div>
                    <div v-else-if="currentTab === 'Sales Items'">
                        <div class="row">
                            <div class="col-12">
                                <button class="btn btn-primary mt-3 mb-5 px-5" @click.prevent.stop="showAddSalesItemModal">Add New Sales Item</button>
                            </div>
                        </div>
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
                                    :items="salesItems"
                                    :fields="salesItemFields"
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
                                    <a class="badge badge-primary text-white mx-1" href="#" @click.stop.prevent="showEditSalesItemModal(row.item)">Edit Sales Item</a>
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
                                                :total-rows="salesItemsRows"
                                                :per-page="perPage"
                                        ></b-pagination>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="currentTab === 'Departments'">
                        <div class="row my-3">
                            <div class="col-12">
                                <button class="btn btn-primary px-5" @click.stop.prevent="showAddDepartmentModal">Add New Department</button>
                            </div>
                        </div>
                        <div class="table-responsive  table-hover mb-0">
                            <table class="table table-hover">
                                <thead>
                                <tr>
                                    <th>S/N</th>
                                    <th>Department Name</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="(department, index) in departments" :key="index">
                                    <td>{{index + 1}}</td>
                                    <td>{{department.name}}</td>
                                    <td> <a class="badge badge-primary text-white mx-1" href="#" @click.stop.prevent="showEditDepartmentModal(department)">Edit Department</a></td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <div>
            <b-modal id="save-sales-item" size="xl" hide-footer header-bg-variant="dark" title="Save Sales Item">
                <SaveSalesItem :item="selectedSalesItem"></SaveSalesItem>
            </b-modal>
            <b-modal id="save-department" size="xl" hide-footer header-bg-variant="dark" title="Save Department">
                <SaveDepartment :department="selectedDepartment"></SaveDepartment>
            </b-modal>
            <b-modal id="add-sales-item" size="xl" hide-footer header-bg-variant="dark" title="Save Sales Item">
                <SaveSalesItem addMultiple></SaveSalesItem>
            </b-modal>
            <b-modal id="add-department" size="xl" hide-footer header-bg-variant="dark" title="Save Department">
                <SaveDepartment addMultiple></SaveDepartment>
            </b-modal>
        </div>

    </Layout>
</template>
