<script>
import appConfig from '@src/app.config'
import Layout from '@layouts/main'
import axios from 'axios'
import RoomPopUp from './components/room-pop-up'

/**
 * Starter component
 */
export default {
  page: {
    title: 'Bookings',
    meta: [{ name: 'description', content: appConfig.description }],
  },
  components: { Layout, RoomPopUp},
  data() {
    return {
      title: 'Bookings',
      tabs: ['available', 'reserved', 'booked'],
      currentTab: 'available',
      loading: true,
      selectedRoom: null,
      rooms: {
        all: [],
        reserved: [],
        available: [],
        booked: []
      }
    }
  },
  mounted: async function(){
    let res = await axios.get('http://localhost:3000/rooms/')
    this.rooms.all = res.data

    this.rooms.reserved = this.rooms.all.filter(room => room.status === 'reserved')
    this.rooms.available = this.rooms.all.filter(room => room.status === 'available')
    this.rooms.booked = this.rooms.all.filter(room => room.status === 'booked')
    this.loading = false
  },

  methods: {
    getBgColour: function(roomType){
      if(roomType === "VIP" || roomType === "VIP Suite"){
        return "dark"
      }

      if(roomType === "suite"){
        return "secondary"
      }

      if(roomType === "deluxe"){
        return "primary"
      }

      return "white"
    },
    getTextColour: function(roomType){
      if(roomType === "classic"){
        return "dark"
      }
      return "white"
    },
    showRoomDetails: function(room){
      this.selectedRoom = room
      this.$bvModal.show('room-modal')
    },
    updateRoomStatus: async function(){
      this.loading = true
      this.rooms.all = []
      this.rooms.reserved = []
      this.rooms.available = []
      this.rooms.booked = []
      let res = await axios.get('http://localhost:3000/rooms/')
      this.rooms.all = res.data

      this.rooms.reserved = this.rooms.all.filter(room => room.status === 'reserved')
      this.rooms.available = this.rooms.all.filter(room => room.status === 'available')
      this.rooms.booked = this.rooms.all.filter(room => room.status === 'booked')
      this.loading = false
    }
  },
}
</script>

<template>
  <Layout>


    <div class="mt-5">
      <b-nav tabs justified>
        <b-nav-item v-for="tab in tabs" :key="tab" :active="currentTab === tab " @click="currentTab = tab">
          <h5 :class="currentTab === tab ? 'font-weight-bold' : 'font-weight-normal'">{{ tab[0].toUpperCase() + tab.slice(1)}}</h5>
        </b-nav-item>
      </b-nav>

      <b-jumbotron bg-variant="light" fluid container-fluid>
        <div class="text-center" v-if="loading">
          <b-spinner variant="primary" label="Spinning"></b-spinner>
        </div>
        <div v-else-if="currentTab === 'available'">
          <div class="row mx-3">
            <a :key="room.id" v-for="room in rooms.available" href="#" class="text-center col-6 col-md-3" @click.stop.prevent="showRoomDetails(room)">
              <b-card :bg-variant="getBgColour(room.type)" :text-variant="getTextColour(room.type)" class="border border-primary">
                <b-card-text class="p-4" >{{ room.room_no }} <br> {{ room.type.toUpperCase() }}</b-card-text>
              </b-card>
            </a>
          </div>

        </div>

        <div v-else-if="currentTab === 'reserved'">
          <div class="row mx-3">
            <a :key="room.id" v-for="room in rooms.reserved" href="#" class="text-center col-6 col-md-3" @click.stop.prevent="showRoomDetails(room)">
              <b-card :bg-variant="getBgColour(room.type)" :text-variant="getTextColour(room.type)" class="border border-primary">
                <b-card-text class="p-4" >{{ room.room_no }} <br> {{ room.type.toUpperCase() }}</b-card-text>
              </b-card>
            </a>
          </div>
        </div>

        <div v-else-if="currentTab === 'booked'">
          <div class="row mx-3">
            <a :key="room.id" v-for="room in rooms.booked" href="#" class="text-center col-6 col-md-3" @click.stop.prevent="showRoomDetails(room)">
              <b-card :bg-variant="getBgColour(room.type)" :text-variant="getTextColour(room.type)" class="border border-primary">
                <b-card-text class="p-4" >{{ room.room_no }} <br> {{ room.type.toUpperCase() }}</b-card-text>
              </b-card>
            </a>
          </div>
        </div>


        <div v-if="selectedRoom !== null">
          <b-modal id="room-modal" size="xl" hide-footer header-bg-variant="dark" :title="selectedRoom.type.toUpperCase() + ' ' + selectedRoom.room_no">
            <RoomPopUp  @update-room-status="updateRoomStatus" :room="selectedRoom"></RoomPopUp>
          </b-modal>
        </div>

      </b-jumbotron>

    </div>
  </Layout>
</template>
