<script>
  import { DateTime } from "luxon"

  export default {
    name: "date-time-selector",
    props: {
      fromDateTime: {
        type: String,
        default: DateTime.local().toISODate(),
      },
      toDateTime: {
        type: String,
        default: DateTime.local().toISODate(),
      },
    },
    data() {
      return {
        fromDate: DateTime.local().toISODate(),
        fromTime: DateTime.local()
          .set({ hour: 8, minute: 0 })
          .toLocaleString(DateTime.TIME_24_SIMPLE),
        fromTimeContext: { hours: 8 },
        toDate: DateTime.local()
          .plus({ days: 1 })
          .toISODate(),
        toTime: DateTime.local()
          .set({ hour: 8, minute: 0 })
          .toLocaleString(DateTime.TIME_24_SIMPLE),
        toTimeContext: { hours: 8 },
      }
    },
    methods: {
      updateDateTimeStrings() {
        let fromDateTimeString = DateTime.fromISO(this.fromDate)
          .set({ hour: this.fromTimeContext.hours })
          .toISO()

        let toDateTimeString = DateTime.fromISO(this.toDate)
          .set({ hour: this.toTimeContext.hours })
          .toISO()

        this.$emit("update:fromDateTime", fromDateTimeString)
        this.$emit("update:toDateTime", toDateTimeString)
      },

      updateFromTimeContext(timeContext) {
        this.fromTimeContext = timeContext
        this.updateDateTimeStrings()
      },

      updateToTimeContext(timeContext) {
        this.toTimeContext = timeContext
        this.updateDateTimeStrings()
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
            @context="updateFromTimeContext"
          ></b-form-timepicker>
        </div>
      </div>
    </div>
    <div class="col-12 col-lg-6">
      <div class="row">
        <div class="form-group col-12">
          <label class="font-weight-bold" for="toDatepicker">To Date: </label>
          <b-form-datepicker id="toDatepicker" v-model="toDate" @input="updateDateTimeStrings"></b-form-datepicker>
        </div>
        <div class="form-group col-12">
          <label class="font-weight-bold" for="toTimePicker">To Time:</label>
          <b-form-timepicker
            v-model="toTime"
            locale="en"
            id="toTimePicker"
            @context="updateToTimeContext"
          ></b-form-timepicker>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
