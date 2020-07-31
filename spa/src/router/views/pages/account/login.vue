<script>
  import Layout from "@layouts/default"
  import { authMethods } from "@state/helpers"
  import Multiselect from "vue-multiselect"
  import appConfig from "@src/app.config"
  import SuccessFailureAlert from "../../../../components/success-failure-alert"
  import ErrorHandler from "@src/ErrorHandler"
  import ManagedStateButton from "../../../../components/managed-state-button"

  /**
   * Login component
   */
  export default {
    page: {
      title: "Log in",
      meta: [{ name: "description", content: `Log in to ${appConfig.title}` }],
    },
    components: { ManagedStateButton, SuccessFailureAlert, Layout, Multiselect },
    data() {
      return {
        username: null,
        password: null,
        department: null,
        departments: [{ id: "x", name: "All Departments" }],
        loginBtnState: "initialize",
        authError: null,
        errors: [],
        success: [],
        tryingToLogIn: false,
        isAuthError: false,
      }
    },

    computed: {
      placeholders() {
        return process.env.NODE_ENV === "production"
          ? {}
          : {
              username: 'Use "admin" to log in with the mock API',
              password: 'Use "password" to log in with the mock API',
            }
      },
    },

    mounted() {
      this.getDepartmentsData()
    },

    methods: {
      ...authMethods,
      // Try to log the user in with the username
      // and password they provided.
      tryToLogIn() {
        if (this.isLoginFormValid()) {
          this.loginBtnState = "loading"
          return this.logIn({
            username: this.username,
            password: this.password,
            department: this.department,
          })
            .then((user) => {
              this.loginBtnState = "success"
              let home = this.getHomeRoute(user)
              this.$router.push(this.$route.query.redirectFrom || { name: home })
            })
            .catch((error) => {
              console.log(error)
              this.loginBtnState = "fail-try-again"
              let errors = ErrorHandler(error)
              this.errors.push(...errors)
            })
        }
      },

      getHomeRoute(user) {
        if (user.role.permissions.includes("can-view-dashboard")) {
          return "Dashboard"
        }

        if (user.role.permissions.includes("can-view-hotel-reception-dashboard")) {
          return "Bookings"
        }

        return "Sales Page"
      },

      async getDepartmentsData() {
        try {
          let response = await this.$httpClient.get("api/departments")
          this.departments.push(...response.data)
        } catch (error) {
          let errors = ErrorHandler(error)
          this.errors.push(...errors)
        }
      },

      isLoginFormValid() {
        if (this.department == null) {
          this.errors.push("Select a department to log into")
          return false
        }

        if (this.username == null || this.password == null) {
          this.errors.push("Enter a valid username and password")
          return false
        }

        return true
      },
    },
  }
</script>

<template>
  <Layout>
    <!-- end row -->
    <div class="account-pages my-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-xl-10">
            <div class="card">
              <div class="card-body p-0">
                <div class="row">
                  <div class="col-12 p-5">
                    <div class="mx-auto mb-5">
                      <a routerLink="/">
                        <img src="@assets/images/rikon-logo.png" alt height="100" />
                      </a>
                    </div>

                    <h6 class="h5 mb-0 mt-4">Welcome back!</h6>
                    <p class="text-muted mt-1 mb-4">
                      Enter your username and password to access admin panel
                    </p>

                    <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>

                    <b-form class="authentication-form">
                      <div class="form-group">
                        <label class="form-control-label">Username:</label>
                        <div class="input-group input-group-merge">
                          <div class="input-group-prepend">
                            <span class="input-group-text">
                              <feather type="mail" class="align-middle icon-dual"></feather>
                            </span>
                          </div>
                          <b-form-input
                            id="input-1"
                            v-model="username"
                            type="text"
                            required
                            placeholder="Enter username"
                          ></b-form-input>
                        </div>
                      </div>
                      <div class="form-group mt-4">
                        <label class="form-control-label">Password:</label>
                        <div class="input-group input-group-merge">
                          <div class="input-group-prepend">
                            <span class="input-group-text">
                              <feather type="lock" class="align-middle icon-dual"></feather>
                            </span>
                          </div>
                          <b-form-input
                            id="password"
                            v-model="password"
                            type="password"
                            required
                            placeholder="Enter your password"
                          ></b-form-input>
                        </div>
                      </div>

                      <div class="form-group">
                        <label for="department">
                          <h6>Select Department: </h6>
                        </label>

                        <Multiselect
                          id="department"
                          :options="departments"
                          track-by="id"
                          label="name"
                          v-model="department"
                        ></Multiselect>
                      </div>

                      <b-form-group id="button-group" class="mt-4 mb-1">
                        <ManagedStateButton
                          main-title="Login"
                          class="btn btn-block"
                          :state="loginBtnState"
                          @clicked="tryToLogIn"
                        ></ManagedStateButton>
                      </b-form-group>
                    </b-form>

                    <div class="py-3 text-center">
                      <span class="font-size-16 font-weight-bold">Contact the admin if you forgot your password</span>
                    </div>
                  </div>
                </div>
              </div>
              <!-- end card-body -->
            </div>
            <!-- end card -->

            <!-- end row -->
          </div>
          <!-- end col -->
        </div>
        <!-- end row -->
      </div>
      <!-- end container -->
    </div>
  </Layout>
</template>

<style lang="scss" module></style>
