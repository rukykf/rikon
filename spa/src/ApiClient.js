import axios from "axios"

let baseUrl = "http://localhost:3990"
if (process.env.NODE_ENV === "production") {
	baseUrl = "/"
}
let apiClient = axios.create({
	baseURL: baseUrl,
	headers: {
		full_name: "Rukky Kofi",
		last_name: "Kofi",
		first_name: "Rukky",
	},
})

export default apiClient
