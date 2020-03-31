<script>
    import appConfig from '@src/app.config'
    import Layout from '@layouts/main'
    import axios from 'axios'
    import SuccessFailureAlert from '@components/success-failure-alert'
    import SaveRoom from "../../../../components/save-room";
    import SaveRoomType from "../../../../components/save-room-type";

    export default {
        page: {
            title: 'Rooms & Room Types',
            meta: [{name: 'description', content: appConfig.description}],
        },
        components: {
            SaveRoomType,
            SaveRoom,
            SuccessFailureAlert,
            Layout
        },
        data: function(){
            return {
                tabs: ['Rooms', 'Room Types'],
                currentTab: 'Rooms',
                errors: [],
                success: [],
                loading: false,
                rooms: [],
                roomTypes: [],
                roomFields: [
                    {key: 'SN', label: 'S/N', sortable: false},
                    {key: 'number', label: 'Room Number', sortable: true, sortDirection: 'desc'},
                    {key: 'roomType', label: 'Room Type', sortable: true, sortDirection: 'desc'},
                    {key: 'actions', label: 'Actions', sortable: false, sortDirection: 'desc'}
                ],
                selectedRoom: {
                    id: null,
                    number: null,
                    type: null
                },
                selectedRoomType: {
                    id: null,
                    name: null,
                    pricePerNight: null
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
            roomRows: function(){
                return this.rooms.length
            }
        },
        mounted: function(){
            this.getData()
        },
        methods: {
            getData: async function(){
                this.loading = true
                let roomsData = await axios.get('http://localhost:3000/roomsconfig')
                let roomTypesData = await axios.get('http://localhost:3000/roomtypes')
                this.rooms = roomsData.data
                this.roomTypes = roomTypesData.data
                setTimeout(() => {
                    this.loading = false
                }, 1500)
            },
            markRoomAsUnavailable: function(selectedRoom){
                console.log('Room is unavailable')
                event.target.innerHTML = "Mark as Available"
            },
            showEditRoomModal: function(selectedRoom){
                this.selectedRoom = selectedRoom
                this.$bvModal.show('save-room')
            },
            showEditRoomTypeModal: function(selectedRoomType){
                this.selectedRoomType = selectedRoomType
                this.$bvModal.show('save-room-type')
            },
            showAddRoomModal: function(){
                this.$bvModal.show('add-room')
            },
            showAddRoomTypeModal: function(){
                this.$bvModal.show('add-room-type')
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
                    <div v-else-if="currentTab === 'Rooms'">
                        <div class="row">
                            <div class="col-12">
                                <button class="btn btn-primary mt-3 mb-5 px-5" @click.prevent.stop="showAddRoomModal">Add New Room</button>
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
                                    :items="rooms"
                                    :fields="roomFields"
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
                                    <a class="badge badge-primary text-white mx-1" href="#" @click.stop.prevent="showEditRoomModal(row.item)">Edit Room</a>
                                    <a class="badge badge-dark text-white mx-1" href="#" @click.stop.prevent="markRoomAsUnavailable(row.item)">Mark as Unavailable</a>
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
                                                :total-rows="roomRows"
                                                :per-page="perPage"
                                        ></b-pagination>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="currentTab === 'Room Types'">
                        <div class="row my-3">
                            <div class="col-12">
                                <button class="btn btn-primary px-5" @click.stop.prevent="showAddRoomTypeModal">Add New Room Type</button>
                            </div>
                        </div>
                        <div class="table-responsive  table-hover mb-0">
                            <table class="table table-hover">
                                <thead>
                                <tr>
                                    <th>S/N</th>
                                    <th>Name</th>
                                    <th>Price per Night</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="(roomType, index) in roomTypes" :key="index">
                                    <td>{{index + 1}}</td>
                                    <td>{{roomType.name}}</td>
                                    <td>N{{roomType.pricePerNight}}</td>
                                    <td>
                                        <a class="badge badge-primary text-white mx-1" href="#" @click.stop.prevent="showEditRoomTypeModal(roomType)">Edit Room Type</a>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <div>
            <b-modal id="save-room" size="xl" hide-footer header-bg-variant="dark" title="Save Room">
                <SaveRoom :room="selectedRoom"></SaveRoom>
            </b-modal>
            <b-modal id="save-room-type" size="xl" hide-footer header-bg-variant="dark" title="Save Room Type">
                <SaveRoomType :roomType="selectedRoomType"></SaveRoomType>
            </b-modal>
            <b-modal id="add-room" size="xl" hide-footer header-bg-variant="dark" title="Save Room">
                <SaveRoom addMultiple></SaveRoom>
            </b-modal>
            <b-modal id="add-room-type" size="xl" hide-footer header-bg-variant="dark" title="Save Room Type">
               <SaveRoomType addMultiple></SaveRoomType>
            </b-modal>
        </div>

    </Layout>
</template>
