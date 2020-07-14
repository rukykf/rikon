<script>
  import _ from "lodash"
  import { DateTime } from "luxon"
  import appConfig from "@src/app.config"
  import Layout from "@layouts/main"
  import RoomPopUp from "./components/room-pop-up"
  import SuccessFailureAlert from "../../../../components/success-failure-alert"

  /**
   * Starter component
   */
  export default {
    page: {
      title: "Bookings",
      meta: [{ name: "description", content: appConfig.description }],
    },
    components: { SuccessFailureAlert, Layout, RoomPopUp },
    data() {
      return {
        title: "Bookings",
        tabs: ["available", "reserved", "booked"],
        errors: [],
        currentTab: "available",
        loading: true,
        selectedRoom: {},
        rooms: {
          all: [],
          reserved: [],
          available: [],
          booked: [],
        },
        numberOfExpiredReservations: 0,
      }
    },
    computed: {
      roomTitle: function() {
        return _.get(this.selectedRoom, ["room", "room_type", "name"])
          ? `${this.selectedRoom.room.room_type.name.toUpperCase()} ${this.selectedRoom.room.room_no}`
          : ""
      },
    },

    mounted: async function() {
      this.updateRoomsList()
    },

    methods: {
      getBgColour: function(roomType) {
        if (roomType === "VIP" || roomType === "VIP Suite" || roomType === "VIP-Suite") {
          return "dark"
        }
        return "primary"
      },
      getTextColour: function(roomType) {
        return "white"
      },
      showRoomDetails: function(room) {
        this.selectedRoom = room
        this.$bvModal.show("room-modal")
      },
      updateRoomsList: async function() {
        try {
          this.loading = true
          let res = await this.$httpClient.get("api/hotel-rooms")
          this.rooms.all = res.data

          this.rooms.reserved = this.rooms.all.filter((room) => room.room_status === "reserved")
          this.rooms.available = this.rooms.all.filter((room) => room.room_status === "available")
          this.rooms.booked = this.rooms.all.filter((room) => room.room_status === "booked")
          this.loading = false

          if (DateTime.local().toLocaleString(DateTime.TIME_SIMPLE) >= "12:00 PM") {
            this.numberOfExpiredReservations = this.rooms.reserved.length

            if (this.numberOfExpiredReservations > 0) {
              this.errors.push(
                `${this.numberOfExpiredReservations} reservations are expiring today. Close these reservations when it's past 12:00 PM.`
              )
            }
          }
        } catch (error) {
          if (_.get(error, ["response", "data", "messages"])) {
            this.errors = error.response.data.messages
          } else {
            this.errors = ["Network error, contact management to resolve the issue"]
          }
        }
      },
    },
  }
</script>

<template>
  <Layout>
    <div class="mt-5">
      <SuccessFailureAlert :errors="errors"></SuccessFailureAlert>

      <b-nav tabs justified>
        <b-nav-item v-for="tab in tabs" :key="tab" :active="currentTab === tab" @click="currentTab = tab">
          <h5 :class="currentTab === tab ? 'font-weight-bold' : 'font-weight-normal'">{{
            tab[0].toUpperCase() + tab.slice(1)
          }}</h5>
        </b-nav-item>
      </b-nav>

      <b-jumbotron bg-variant="light" fluid container-fluid>
        <div class="text-center" v-if="loading">
          <b-spinner variant="primary" label="Spinning"></b-spinner>
        </div>
        <div v-else-if="currentTab === 'available'">
          <div class="row mx-3">
            <a
              :key="room.id"
              v-for="room in rooms.available"
              href="#"
              class="text-center col-12 col-sm-6 col-lg-3"
              @click.stop.prevent="showRoomDetails(room)"
            >
              <b-card
                :bg-variant="getBgColour(room.room.room_type.name)"
                :text-variant="getTextColour(room.room.room_type.name)"
                class="border border-primary"
              >
                <b-card-text class="p-4">
                  {{ room.room.room_no }} <br /><br />
                  {{ room.room.room_type.name.toUpperCase() }} <br />
                  {{ room.room.room_type.price_per_night | money }} <small>per night</small>
                </b-card-text>
              </b-card>
            </a>
          </div>
        </div>

        <div v-else-if="currentTab === 'reserved'">
          <div class="row mx-3">
            <a
              :key="room.id"
              v-for="room in rooms.reserved"
              href="#"
              class="text-center col-12 col-sm-6 col-lg-3"
              @click.stop.prevent="showRoomDetails(room)"
            >
              <b-card
                :bg-variant="getBgColour(room.room.room_type.name)"
                :text-variant="getTextColour(room.room.room_type.name)"
                class="border border-primary"
              >
                <b-card-text class="p-4"
                  >{{ room.room.room_no }} <br /><br />
                  {{ room.room.room_type.name.toUpperCase() }}<br />
                  {{ room.room.room_type.price_per_night | money }} <small>per night</small>
                </b-card-text>
              </b-card>
            </a>
          </div>
        </div>

        <div v-else-if="currentTab === 'booked'">
          <div class="row mx-3">
            <a
              :key="room.id"
              v-for="room in rooms.booked"
              href="#"
              class="text-center col-12 col-sm-6 col-lg-3"
              @click.stop.prevent="showRoomDetails(room)"
            >
              <b-card
                :bg-variant="getBgColour(room.room.room_type.name)"
                :text-variant="getTextColour(room.room.room_type.name)"
                class="border border-primary"
              >
                <b-card-text class="p-4"
                  >{{ room.room.room_no }} <br /><br />
                  {{ room.room.room_type.name.toUpperCase() }}<br />
                  {{ room.room.room_type.price_per_night | money }} <small>per night</small>
                </b-card-text>
              </b-card>
            </a>
          </div>
        </div>

        <b-modal
          @hide="updateRoomsList"
          id="room-modal"
          size="xl"
          hide-footer
          header-bg-variant="dark"
          :title="roomTitle"
        >
          <RoomPopUp :room="selectedRoom"></RoomPopUp>
        </b-modal>
      </b-jumbotron>
    </div>
  </Layout>
</template>
