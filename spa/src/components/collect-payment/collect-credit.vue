<script>
  import ManagedStateButton from "@components/managed-state-button"
  import SuccessFailureAlert from "@components/success-failure-alert"
  import ErrorHandler from "@src/ErrorHandler"
  import Multiselect from "vue-multiselect"

  export default {
    name: "collect-credit",
    components: { SuccessFailureAlert, ManagedStateButton, Multiselect },
    props: {
      state: {
        type: String,
        default: "initialize", // possible values are ['loading', 'success', 'fail', 'try-again']
      },

      sellableType: {
        type: String,
        required: true,
      },

      sellableId: {
        type: Number,
        required: true,
      },

      customerDetails: {
        type: Object,
        default: function() {
          return {
            name: "",
            room: "",
            phone: "",
          }
        },
      },
    },
    data: function() {
      return {
        name: this.customerDetails.name,
        errors: [],
        success: [],
        phoneNumber: this.customerDetails.phone,
        roomNumber: this.customerDetails.room,
        authorizedBy: "",
        nameValidation: null,
        additionalDetails: null,
        disabled: false,
        submitBtnState: "initialize",
        roomNumberValidation: null,
        phoneNumberValidation: null,
        authorizedByValidation: null,
        additionalDetailsValidation: null,
        debtAuthorizers: [],
        loading: false,
      }
    },

    computed: {
      computedDisabled: function() {
        if (this.state === "success" || this.state === "fail") {
          return true
        }
        return this.disabled
      },

      computedSubmitBtnState: function() {
        if (this.submitBtnState !== "loading") {
          return this.state
        } else {
          return this.submitBtnState
        }
      },
    },

    watch: {},

    mounted() {
      this.getDebtAuthorizersData()
    },

    methods: {
      async getDebtAuthorizersData() {
        try {
          this.loading = true
          let url = "api/management-list?list_name=authorized_to_authorize"
          let { data: debtApprovers } = await this.$httpClient.get(url)
          this.debtAuthorizers = debtApprovers
          this.loading = false
        } catch (error) {
          this.loading = false
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },
      validateAndSubmit: async function() {
        if (this.isValid()) {
          try {
            this.submitBtnState = "loading"
            let response = await this.$httpClient.post("api/sales", {
              sellable_type: this.sellableType,
              sellable_id: this.sellableId,
              transaction_type: "credit",
              transaction_details: {
                credit_authorized_by: { name: this.authorizedBy.full_name },
                customer_details: {
                  name: this.name,
                  phone: this.phoneNumber,
                  room: this.roomNumber,
                  additionalDetails: this.additionalDetails,
                },
              },
            })
            this.success.push(`Successfully recorded debt for ${this.name}`)
            this.submitBtnState = "success-try-again"
            this.$emit("success", response.data)
          } catch (error) {
            let errors = ErrorHandler(error)
            this.submitBtnState = "fail-try-again"
            this.$emit("error", errors)
            this.errors.push(...errors)
          }
          this.nameValidation = null
          this.roomNumberValidation = null
          this.phoneNumberValidation = null
          this.authorizedByValidation = null
        }
      },
      isValid: function() {
        if (this.authorizedBy == null || this.authorizedBy.length < 1 || this.authorizedBy.full_name.length < 1) {
          this.authorizedByValidation = "Enter the name of whoever is authorizing this debt"
          return false
        }

        // name is always required
        if (this.name.length < 1) {
          this.nameValidation = "The customer's name is required"
          return false
        }

        return true
      },
    },
  }
</script>

<template>
  <div class="row text-left mt-3 ">
    <div class="col-12 payment-form pt-4 mt-2 mx-auto">
      <div class="card ">
        <div class="card-body">
          <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>

          <div v-if="loading" class="text-center">
            <b-spinner class="p-5 m-5" variant="dark"></b-spinner>
          </div>

          <div v-else>
            <div class="pt-3">
              <div class="form-group">
                <label for="authorizedBy">
                  <h6>Select the name of whoever authorized this debt </h6>
                  <small v-if="authorizedByValidation !== null" class="text-danger"
                    >* {{ authorizedByValidation }}</small
                  >
                </label>

                <Multiselect
                  v-model="authorizedBy"
                  :options="debtAuthorizers"
                  id="authorizedBy"
                  :disabled="computedDisabled"
                  label="full_name"
                  track-by="id"
                ></Multiselect>
              </div>

              <div class="form-group">
                <label for="additionalDetails">
                  <h6>Additional Details (optional): </h6>
                  <small v-if="additionalDetailsValidation !== null" class="text-danger"
                    >* {{ additionalDetailsValidation }}</small
                  >
                </label>

                <input
                  type="text"
                  id="additionalDetails"
                  name="text"
                  :disabled="computedDisabled"
                  v-model="additionalDetails"
                  placeholder=""
                  class="form-control "
                />
              </div>

              <div class="form-group">
                <label for="name">
                  <h6>Enter Customer Name: </h6>
                  <small v-if="nameValidation !== null" class="text-danger">* {{ nameValidation }}</small>
                </label>

                <input
                  type="text"
                  id="name"
                  name="text"
                  :disabled="computedDisabled"
                  v-model="name"
                  placeholder=""
                  class="form-control "
                />
              </div>

              <div class="form-group">
                <label for="roomNumber">
                  <h6>Enter Room Number <span class="font-italic">(optional)</span>: </h6>
                  <small v-if="roomNumberValidation !== null" class="text-danger">* {{ roomNumberValidation }}</small>
                </label>

                <input
                  type="number"
                  id="roomNumber"
                  name="number"
                  :disabled="computedDisabled"
                  v-model.number="roomNumber"
                  placeholder="e.g 103"
                  class="form-control "
                />
              </div>

              <div class="form-group">
                <label for="phoneNumber">
                  <h6>Enter Customer Phone Number <span class="font-italic">(optional)</span>: </h6>
                  <small v-if="phoneNumberValidation !== null" class="text-danger">* {{ phoneNumberValidation }}</small>
                </label>

                <input
                  type="text"
                  id="phoneNumber"
                  name="text"
                  :disabled="computedDisabled"
                  v-model="phoneNumber"
                  placeholder="e.g 08123456789"
                  class="form-control "
                />
              </div>
            </div>

            <p>
              <ManagedStateButton
                :state="computedSubmitBtnState"
                main-title="Submit"
                main-variant="primary"
                @clicked="validateAndSubmit"
              ></ManagedStateButton>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .payment-form {
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
