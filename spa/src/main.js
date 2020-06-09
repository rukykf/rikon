import Vue from "vue"
import App from "./app"
import router from "@router"
import store from "@state/store"
import "@components/_globals"

import BootstrapVue from "bootstrap-vue"
import VueApexCharts from "vue-apexcharts"
import Vuelidate from "vuelidate"
import VueMask from "v-mask"
import vco from "v-click-outside"
import VueRouter from "vue-router"
import VueFeather from "vue-feather"
import flatPickr from "vue-flatpickr-component"
import VueHtmlToPaper from "vue-html-to-paper/src"
import { formatMoney } from "accounting-js"
import { DateTime } from "luxon"
import ApiClient from "./ApiClient"

Vue.use(VueFeather)
Vue.use(flatPickr)

Vue.use(VueRouter)
Vue.use(vco)
Vue.prototype.$httpClient = ApiClient

// Don't warn about using the dev version of Vue in development.
Vue.config.productionTip = process.env.NODE_ENV === "production"

// If running inside Cypress...
if (process.env.VUE_APP_TEST === "e2e") {
	// Ensure tests fail when Vue emits an error.
	Vue.config.errorHandler = window.Cypress.cy.onUncaughtException
}

let paperOptions = {
	styles: ["http://localhost:3000/bootstrap.min.css"],
}
Vue.use(BootstrapVue)
Vue.use(Vuelidate)
Vue.use(VueMask)

Vue.use(VueHtmlToPaper, paperOptions)

Vue.component("apexchart", VueApexCharts)

// Uncomment this if you are having api served through other url or do not want to use fake backend
// Vue.prototype.$http = require('axios')
// Vue.prototype.$http.defaults.baseURL  = 'http://mock-api.coderthemes.com/'

// Global filters for this application
Vue.filter("capitalize", function(value) {
	if (!value) return ""
	value = value.toString()
	return value.charAt(0).toUpperCase() + value.slice(1)
})

Vue.filter("money", function(value) {
	if (value == null) {
		return "nil"
	}

	if (value === 0) {
		return formatMoney(value, { symbol: "N", precision: 2 })
	}
	return formatMoney(value, { symbol: "N", precision: 0 })
})

Vue.filter("humanDate", function(value) {
	let date = DateTime.fromISO(value)
	return date.toLocaleString(DateTime.DATE_HUGE)
})

Vue.filter("humanDateWithTime", function(value) {
	let date = DateTime.fromISO(value)
	return date.toLocaleString(DateTime.DATETIME_MED)
})

Vue.filter("humanTime", function(value) {
	let date = DateTime.fromISO(value)
	return date.toLocaleString(DateTime.TIME_SIMPLE)
})

const app = new Vue({
	router,
	store,
	render: (h) => h(App),
}).$mount("#app")

// If running e2e tests...
if (process.env.VUE_APP_TEST === "e2e") {
	// Attach the app to the window, which can be useful
	// for manually setting state in Cypress commands
	// such as `cy.logIn()`.
	window.__app__ = app
}
