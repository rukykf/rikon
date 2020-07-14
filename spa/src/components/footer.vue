<script>
import { DateTime } from "luxon"

export default {
 computed: {
  currentYear: function() {
   return DateTime.local().year
  },
 },
}
</script>

<template>
 <!-- Footer Start -->
 <footer class="footer">
  <div class="container-fluid">
   <div class="row">
    <div class="col-12"> 2020 - {{ currentYear }} &copy; Kofi Oghenerukevwe. All Rights Reserved. </div>
   </div>
  </div>
 </footer>
 <!-- end Footer -->
</template>
