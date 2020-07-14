import axios from "axios"
import ApiClient from "@src/ApiClient"

export const state = {
 currentUser: getSavedState("auth.currentUser"),
 currentDepartment: getSavedState("auth.currentDepartment"),
}

export const mutations = {
 SET_CURRENT_USER(state, newValue) {
  state.currentUser = newValue
  saveState("auth.currentUser", newValue)
  setDefaultAuthHeaders(state)
 },

 SET_CURRENT_DEPARTMENT(state, newValue) {
  state.currentDepartment = newValue
  saveState("auth.currentDepartment", newValue)
 },
}

export const getters = {
 // Whether the user is currently logged in.
 loggedIn(state) {
  return !!state.currentUser
 },

 user(state) {
  return state.currentUser
 },
}

export const actions = {
 // This is automatically run in `src/state/store.js` when the app
 // starts, along with any other actions named `init` in other modules.
 init({ commit, state, dispatch }) {
  setDefaultAuthHeaders(state)
 },

 // Logs in the current user.
 logIn({ commit, state, dispatch, getters }, { username, password, department } = {}) {
  return ApiClient.post("/api/session", { username, password }).then((response) => {
   const user = response.data
   commit("SET_CURRENT_USER", user)
   commit("SET_CURRENT_DEPARTMENT", department)
   setDefaultAuthHeaders(state)
   return user
  })
 },

 // Logs out the current user.
 logOut({ commit, state }) {
  commit("SET_CURRENT_USER", null)
  commit("SET_CURRENT_DEPARTMENT", null)
  setDefaultAuthHeaders(state)
 },

 // register the user
 register({ commit, dispatch, getters }, { fullname, email, password } = {}) {
  if (getters.loggedIn) return dispatch("validate")

  return axios.post("/api/register", { fullname, email, password }).then((response) => {
   const user = response.data
   return user
  })
 },

 // register the user
 resetPassword({ commit, dispatch, getters }, { email } = {}) {
  if (getters.loggedIn) return dispatch("validate")

  return axios.post("/api/reset", { email }).then((response) => {
   const message = response.data
   return message
  })
 },

 // Validates the current user's token and refreshes it
 // with new data from the API.
 validate({ commit, state }) {
  if (!state.currentUser) return Promise.resolve(null)

  return axios
   .get("/api/session")
   .then((response) => {
    const user = response.data
    commit("SET_CURRENT_USER", user)
    return user
   })
   .catch((error) => {
    if (error.response && error.response.status === 401) {
     commit("SET_CURRENT_USER", null)
    }
    return null
   })
 },
}

// ===
// Private helpers
// ===

function getSavedState(key) {
 return JSON.parse(window.localStorage.getItem(key))
}

function saveState(key, state) {
 window.localStorage.setItem(key, JSON.stringify(state))
}

async function setDefaultAuthHeaders(state) {
 if (state.currentUser !== null) {
  ApiClient.defaults.headers.common["full_name"] = `${state.currentUser.first_name} ${state.currentUser.last_name}`
  ApiClient.defaults.headers.common["last_name"] = state.currentUser.last_name
  ApiClient.defaults.headers.common["first_name"] = state.currentUser.first_name
  ApiClient.defaults.headers.common["username"] = state.currentUser.username
 } else {
  ApiClient.defaults.headers.common["full_name"] = null
  ApiClient.defaults.headers.common["last_name"] = null
  ApiClient.defaults.headers.common["first_name"] = null
  ApiClient.defaults.headers.common["username"] = null
 }
}
