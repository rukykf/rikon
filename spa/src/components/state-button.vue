<script>
export default {
 name: "state-button",
 props: {
  buttonState: {
   type: Object,
   required: true,
  },
 },
 methods: {
  clicked: function() {
   this.$emit("clicked")
  },
 },
}
</script>
<template>
 <b-button :variant="buttonState.variant" @click.prevent.stop="clicked" :disabled="buttonState.disabled">
  <span v-if="buttonState.loading" class="text-center">
   <b-spinner variant="white" class="mx-5"></b-spinner>
  </span>
  <span v-else>
   <feather v-if="buttonState.icon !== 'none'" :type="buttonState.icon" class="align-middle"></feather>
   <span class="align-middle">{{ buttonState.title }}</span>
  </span>
 </b-button>
</template>
