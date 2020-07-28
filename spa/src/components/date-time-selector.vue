<script>
  import { DateTime } from "luxon"

  export default {
    name: "date-time-selector",
    data() {
      return {
        fromDate: DateTime.local().toISODate(),
        fromTime: DateTime.local()
          .set({ hour: 8, minute: 0 })
          .toLocaleString(DateTime.TIME_24_SIMPLE),
        fromTimeContext: null,
        toDate: DateTime.local()
          .plus({ days: 1 })
          .toISODate(),
        toTime: DateTime.local()
          .set({ hour: 8, minute: 0 })
          .toLocaleString(DateTime.TIME_24_SIMPLE),
        toTimeContext: null,
      }
    },
    methods: {
      updateDateTimeStrings() {
        console.log(this.fromDate)
      },

      updateFromTime(timeContext) {
        this.fromTimeContext = timeContext
      },

      updateToTime(timeContext) {
        this.toTimeContext = timeContext
      },
    },
  }
</script>

<template>
  <div class="row">
    <div class="col-12 col-lg-6">
      <div class="row">
        <div class="form-group col-12">
          <label class="font-weight-bold" for="fromDatepicker">From Date: </label>
          <b-form-datepicker id="fromDatePicker" v-model="fromDate" @input="updateDateTimeStrings"></b-form-datepicker>
        </div>
        <div class="form-group col-12">
          <label class="font-weight-bold" for="fromTimePicker">From Time:</label>
          <b-form-timepicker
            v-model="fromTime"
            locale="en"
            id="fromTimePicker"
            @context="updateFromTime"
          ></b-form-timepicker>
        </div>
      </div>
    </div>
    <div class="col-12 col-lg-6">
      <div class="row">
        <div class="form-group col-12">
          <label class="font-weight-bold" for="toDatepicker">To Date: </label>
          <b-form-datepicker id="toDatepicker" v-model="toDate"></b-form-datepicker>
        </div>
        <div class="form-group col-12">
          <label class="font-weight-bold" for="toTimePicker">To Time:</label>
          <b-form-timepicker v-model="toTime" locale="en" id="toTimePicker" @context="updateToTime"></b-form-timepicker>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
