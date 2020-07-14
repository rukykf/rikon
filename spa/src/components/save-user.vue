<script>
import SuccessFailureAlert from "./success-failure-alert"
import Multiselect from "vue-multiselect"
import ErrorHandler from "@src/ErrorHandler"
import ManagedStateButton from "./managed-state-button"

export default {
 name: "save-user",
 components: { ManagedStateButton, SuccessFailureAlert, Multiselect },
 props: {
  user: {
   type: Object,
   default: function() {
    return {
     id: null,
     first_name: null,
     last_name: null,
     role: null,
     role_id: null,
     username: null,
     password: null,
    }
   },
  },
  addMultiple: {
   type: Boolean,
   default: false,
  },
 },
 data: function() {
  return {
   submitBtnState: "initialize",
   newUserFirstNameValidation: null,
   newUserLastNameValidation: null,
   newUserUsernameValidation: null,
   newUserPasswordValidation: null,
   newUserRoleValidation: null,
   newUser: {
    first_name: this.user.first_name,
    last_name: this.user.last_name,
    role: this.user.role,
    role_id: this.user.role_id,
    username: this.user.username,
    password: this.user.password,
   },
   roles: [],
   disabled: false,
   errors: [],
   success: [],
  }
 },

 mounted: function() {
  this.getRoles()
 },

 methods: {
  getRoles: async function() {
   try {
    let response = await this.$httpClient.get("api/roles")
    this.roles = response.data
   } catch (error) {
    let errors = ErrorHandler(error)
    this.errors.push(...errors)
   }
  },
  validateAndSubmit: async function() {
   if (this.isValid()) {
    try {
     this.submitBtnState = "loading"
     this.newUser.role_id = this.newUser.role.id
     let url = `api/users/`
     if (this.user.id !== null) {
      url += this.user.id
     }
     console.log(url)
     let response = await this.$httpClient.post(url, this.newUser)
     this.success.push(`Successfully saved user with username: ${response.data.username}`)
     if (this.addMultiple) {
      this.submitBtnState = "success-try-again"
      this.resetForm()
     } else {
      this.disabled = true
      this.submitBtnState = "success"
     }
    } catch (error) {
     this.submitBtnState = "fail-try-again"
     let errors = ErrorHandler(error)
     this.errors.push(...errors)
    }
   }
  },
  isValid: function() {
   if (this.newUser.first_name === null || this.newUser.first_name.length < 1) {
    this.newUserFirstNameValidation = "First name is required"
    return false
   }

   if (this.newUser.last_name === null || this.newUser.last_name.length < 1) {
    this.newUserLastNameValidation = "Last name is required"
    return false
   }

   if (this.newUser.role === null || this.newUser.role === {}) {
    this.newUserRoleValidation = "A user must have a role"
    return false
   }

   if (this.newUser.username === null || this.newUser.username.length < 1) {
    this.newUserUsernameValidation = "Username is required for login into the system"
    return false
   }

   if (this.newUser.password === null || this.newUser.password.length < 1) {
    this.newUserPasswordValidation = "Password is required for login into the system"
    return false
   }

   return true
  },
  resetForm: function() {
   this.newUser.first_name = null
   this.newUser.last_name = null
   this.newUser.role = this.roles[0]
   this.newUser.username = null
   this.newUser.password = null
   this.newUserFirstNameValidation = null
   this.newUserLastNameValidation = null
   this.newUserUsernameValidation = null
   this.newUserPasswordValidation = null
   this.newUserRoleValidation = null
  },
 },
}
</script>

<template>
 <div>
  <SuccessFailureAlert :errors="errors" :success="success"></SuccessFailureAlert>
  <div class="pt-3">
   <div class="form-group">
    <label for="userFirstName">
     <h6>Enter First Name: </h6>
     <small v-if="newUserFirstNameValidation !== null" class="text-danger">* {{ newUserFirstNameValidation }}</small>
    </label>

    <input
     type="text"
     id="userFirstName"
     name="userFirstName"
     :disabled="disabled"
     v-model="newUser.first_name"
     placeholder=""
     required
     class="form-control "
    />
   </div>

   <div class="form-group">
    <label for="userLastName">
     <h6>Enter Last Name: </h6>
     <small v-if="newUserLastNameValidation !== null" class="text-danger">* {{ newUserLastNameValidation }}</small>
    </label>

    <input
     type="text"
     id="userLastName"
     name="userLastName"
     :disabled="disabled"
     v-model="newUser.last_name"
     placeholder=""
     required
     class="form-control "
    />
   </div>

   <div class="form-group">
    <label for="userRole">
     <h6>Select User Role: </h6>
     <small v-if="newUserRoleValidation !== null" class="text-danger">* {{ newUserRoleValidation }}</small>
    </label>

    <Multiselect
     :disabled="disabled"
     id="userRole"
     loading
     :options="roles"
     track-by="id"
     label="name"
     v-model="newUser.role"
    ></Multiselect>
   </div>

   <div class="form-group">
    <label for="username">
     <h6>Enter username (for login into the system): </h6>
     <small v-if="newUserUsernameValidation !== null" class="text-danger">* {{ newUserUsernameValidation }}</small>
    </label>

    <input
     type="text"
     id="username"
     name="username"
     :disabled="disabled"
     v-model="newUser.username"
     placeholder=""
     required
     class="form-control "
    />
   </div>

   <div class="form-group">
    <label for="password">
     <h6>Enter password (for login into the system): </h6>
     <small v-if="newUserPasswordValidation !== null" class="text-danger">* {{ newUserPasswordValidation }}</small>
    </label>

    <input
     type="text"
     id="password"
     name="password"
     :disabled="disabled"
     v-model="newUser.password"
     placeholder=""
     required
     class="form-control "
    />
   </div>
  </div>

  <p>
   <ManagedStateButton
    mainTitle="Save User"
    successTryAgainTitle="Save Another User"
    :state="submitBtnState"
    @clicked="validateAndSubmit"
   ></ManagedStateButton>
  </p>
 </div>
</template>
