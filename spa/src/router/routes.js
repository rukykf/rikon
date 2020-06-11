import store from "@state/store"

// auth related routes
const authRoutes = [
	{
		path: "/login",
		name: "login",
		component: () => lazyLoadView(import("@views/pages/account/login")),
		meta: {
			beforeResolve(routeTo, routeFrom, next) {
				// If the user is already logged in
				if (store.getters["auth/loggedIn"]) {
					// Redirect to the home page instead
					return next({ name: "Dashboard" })
				} else {
					// Continue to the login page
					return next()
				}
			},
		},
	},
]

// error pages
const errorPagesRoutes = [
	{
		path: "/404",
		name: "404",
		component: require("@views/pages/errors/error-404").default,
		// Allows props to be passed to the 404 page through route
		// params, such as `resource` to define what wasn't found.
		props: true,
	},
	{
		path: "/500",
		name: "500",
		component: require("@views/pages/errors/error-500").default,
		props: true,
	},
	// Redirect any unmatched routes to the 404 page. This may
	// require some server configuration to work in production:
	// https://router.vuejs.org/en/essentials/history-mode.html#example-server-configurations
	{
		path: "*",
		redirect: "404",
	},
]

// dashboard
const dashboardRoutes = [
	{
		path: "/",
		name: "Dashboard",
		icon: "home",
		component: () => lazyLoadView(import("@views/pages/dashboard/dashboard")),
		meta: { authRequired: true, permission: "can-view-dashboard" },
		props: (route) => ({ user: store.state.auth.currentUser || {} }),
	},
]

const logoutRoutes = [
	{
		path: "/logout",
		name: "Logout",
		icon: "lock",
		beforeEnter(routeTo, routeFrom, next) {
			store.dispatch("auth/logOut")
			// Navigate back to previous page, or home as a fallback
			next({ name: "login" })
		},
		meta: {
			authRequired: true,
		},
	},
]

const bookingsAndReservationsRoutes = [
	{
		path: "/hotel",
		name: "Room Bookings",
		icon: "key",
		meta: { authRequired: true, permission: "can-view-hotel-reception-dashboard" },
		// create a container component
		component: {
			render(c) {
				return c("router-view")
			},
		},
		props: (route) => ({ user: store.state.auth.currentUser || {} }),
		children: [
			{
				path: "bookings",
				name: "Bookings",
				meta: { authRequired: true, permission: "can-view-hotel-reception-dashboard" },
				component: () => lazyLoadView(import("@views/pages/hotel-bookings/bookings")),
			},
		],
	},
]

const pointOfSalesRoutes = [
	{
		path: "/pos",
		name: "Point of Sales",
		icon: "shopping-bag",
		meta: { authRequired: true, permission: "can-view-point-of-sales-page" },
		// create a container component
		component: {
			render(c) {
				return c("router-view")
			},
		},
		props: (route) => ({ user: store.state.auth.currentUser || {} }),
		children: [
			{
				path: "point-of-sales",
				name: "Sales Page",
				meta: { authRequired: true, permission: "can-view-point-of-sales-page" },
				component: () => lazyLoadView(import("@views/pages/pos/point-of-sales")),
			},
		],
	},
]

const storeRoutes = [
	{
		path: "/store",
		name: "Store",
		icon: "tag",
		meta: { authRequired: false },
		// create a container component
		component: {
			render(c) {
				return c("router-view")
			},
		},
		props: (route) => ({ user: store.state.auth.currentUser || {} }),
		children: [
			{
				path: "inventory",
				name: "Inventory",
				meta: { authRequired: false },
				component: () => lazyLoadView(import("@views/pages/store/inventory")),
			},
			{
				path: "history",
				name: "History",
				meta: { authRequired: false },
				component: () => lazyLoadView(import("@views/pages/store/history")),
			},
			{
				path: "queries",
				name: "Queries",
				meta: { authRequired: false },
				component: () => lazyLoadView(import("@views/pages/store/queries")),
			},
		],
	},
]

const configurationRoutes = [
	{
		path: "/configuration",
		name: "Configuration",
		icon: "command",
		meta: { authRequired: true, permission: "can-view-configurations" },
		// create a container component
		component: {
			render(c) {
				return c("router-view")
			},
		},
		props: (route) => ({ user: store.state.auth.currentUser || {} }),
		children: [
			{
				path: "users-roles",
				name: "Users & Roles",
				meta: { authRequired: true, permission: "can-view-all-configurations" },
				component: () => lazyLoadView(import("@views/pages/configuration/users-roles")),
			},
			{
				path: "sales-items-departments",
				name: "Sales Items & Departments",
				meta: { authRequired: true, permission: "can-view-all-configurations" },
				component: () => lazyLoadView(import("@views/pages/configuration/sales-items-departments")),
			},
			{
				path: "rooms-types",
				name: "Rooms & Room Types",
				meta: { authRequired: true, permission: "can-view-all-configurations" },
				component: () => lazyLoadView(import("@views/pages/configuration/rooms-types")),
			},
		],
	},
]

const reportsRoutes = [
	{
		path: "/reports",
		name: "Reports",
		icon: "bar-chart-2",
		meta: { authRequired: true, permission: "can-view-reports" },
		// create a container component
		component: {
			render(c) {
				return c("router-view")
			},
		},
		props: (route) => ({ user: store.state.auth.currentUser || {} }),
		children: [
			{
				path: "sales-history",
				name: "Sales History",
				meta: { authRequired: true, permission: "can-view-reports" },
				component: () => lazyLoadView(import("@views/pages/reports/sales")),
			},
			{
				path: "credit-sales",
				name: "Manage Credit Sales",
				meta: { authRequired: true, permission: "can-view-reports" },
				component: () => lazyLoadView(import("@views/pages/reports/credit-sales")),
			},
			{
				path: "bookings",
				name: "Booking History",
				meta: { authRequired: true, permission: "can-view-reports" },
				component: () => lazyLoadView(import("@views/pages/reports/bookings")),
			},
			{
				path: "orders",
				name: "Order History",
				meta: { authRequired: true, permission: "can-view-reports" },
				component: () => lazyLoadView(import("@views/pages/reports/orders")),
			},
		],
	},
]

const authProtectedRoutes = [
	...dashboardRoutes,
	...bookingsAndReservationsRoutes,
	...pointOfSalesRoutes,
	...reportsRoutes,
	...configurationRoutes,
	...logoutRoutes,
]
const allRoutes = [...authRoutes, ...authProtectedRoutes, ...errorPagesRoutes]

export { allRoutes, authProtectedRoutes }

// Lazy-loads view components, but with better UX. A loading view
// will be used if the component takes a while to load, falling
// back to a timeout view in case the page fails to load. You can
// use this component to lazy-load a route with:
//
// component: () => lazyLoadView(import('@views/my-view'))
//
// NOTE: Components loaded with this strategy DO NOT have access
// to in-component guards, such as beforeRouteEnter,
// beforeRouteUpdate, and beforeRouteLeave. You must either use
// route-level guards instead or lazy-load the component directly:
//
// component: () => import('@views/my-view')
//
function lazyLoadView(AsyncView) {
	const AsyncHandler = () => ({
		component: AsyncView,
		// A component to use while the component is loading.
		loading: require("@components/_loading").default,
		// Delay before showing the loading component.
		// Default: 200 (milliseconds).
		delay: 400,
		// A fallback component in case the timeout is exceeded
		// when loading the component.
		// error: require('@views/_timeout').default,
		// Time before giving up trying to load the component.
		// Default: Infinity (milliseconds).
		timeout: 10000,
	})

	return Promise.resolve({
		functional: true,
		render(h, { data, children }) {
			// Transparently pass any props or children
			// to the view component.
			return h(AsyncHandler, data, children)
		},
	})
}
