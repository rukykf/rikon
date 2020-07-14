import axios from "axios"

let baseUrl = "http://localhost:3990"
if (process.env.NODE_ENV === "production") {
  baseUrl = "/"
}
let apiClient = axios.create({
  baseURL: baseUrl,
})

export default apiClient
