<script>
export default {
 name: "managed-state-button",
 props: {
  mainTitle: {
   type: String,
   default: "Submit",
  },
  featherIcon: {
   type: String,
   required: false,
   default: "",
  },
  mainVariant: {
   type: String,
   default: "primary",
  },
  failTryAgainTitle: {
   type: String,
   default: "Try Again",
  },
  successTitle: {
   type: String,
   default: "Success",
  },
  failTitle: {
   type: String,
   default: "Failed",
  },
  successTryAgainTitle: {
   type: String,
   default: "Submit Another",
  },
  state: {
   type: String,
   default: "initialize", // possible values are ['loading', 'success', 'fail', 'fail-try-again', 'success-try-again', 'initialize']
  },
 },
 computed: {
  icon: function() {
   if (this.featherIcon.length > 0) {
    return this.featherIcon
   }

   if (this.state === "success") {
    return "check"
   }
   if (this.state === "fail") {
    return "x"
   }
   if (this.state === "loading") {
    return "none"
   }
   if (this.state === "fail-try-again") {
    return "refresh-cw"
   }
   if (this.state === "success-try-again") {
    return "repeat"
   }
   return "none"
  },
  variant: function() {
   if (this.state === "fail" || this.state === "fail-try-again") {
    return "danger"
   }
   if (this.state === "success") {
    return "success"
   }
   return this.mainVariant
  },
  title: function() {
   if (this.state === "success") {
    return this.successTitle
   }
   if (this.state === "fail") {
    return this.failTitle
   }
   if (this.state === "fail-try-again") {
    return this.failTryAgainTitle
   }
   if (this.state === "success-try-again") {
    return this.successTryAgainTitle
   }
   return this.mainTitle
  },
  disabled: function() {
   if (this.state === "success" || this.state === " fail") {
    return true
   }
   return false
  },
  loading: function() {
   if (this.state === "loading") {
    return true
   }
   return false
  },
 },
 methods: {
  clicked: function() {
   if (this.state !== "loading") {
    this.$emit("clicked")
   }
  },
 },
}
</script>
<template>
 <b-button :variant="variant" @click.prevent.stop="clicked" :disabled="disabled">
  <span v-if="loading" class="text-center">
   <b-spinner variant="white" class="mx-5"></b-spinner>
  </span>
  <span v-else>
   <feather v-if="icon !== 'none'" :type="icon" class="align-middle mr-2"></feather>
   <span class="align-middle">{{ title }}</span>
  </span>
 </b-button>
</template>
