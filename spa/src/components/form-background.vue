<template>
  <div class="row text-left mt-3 ">
    <div class="col-12 form pt-4 mt-2 mx-auto">
      <div class="card ">
        <div class="card-body">
          <slot>A form goes here</slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "form-background",
  }
</script>

<style scoped>
  .form {
    background: #f5f5f5;
  }

  .rounded {
    border-radius: 1rem;
  }

  .nav-pills .nav-link {
    color: #555;
  }

  .nav-pills .nav-link.active {
    color: white;
  }

  input[type="radio"] {
    margin-right: 5px;
  }

  .bold {
    font-weight: bold;
  }
</style>
