const express = require("express")
const history = require("connect-history-api-fallback")
const cors = require("cors")
const path = require("path")
const AuthenticationController = require("./src/modules/authentication/AuthenticationController")
const ConfigurationRoutes = require("./src/routes/configuration-module")
const salesRoutes = require("./src/routes/sales-module")
const reportsRoutes = require("./src/routes/reports-module")
const authenticationRoutes = require("./src/routes/authentication-module")

const UsersController = require("./src/modules/configuration/UsersController")

const app = express()
const port = 3990
const user = {
  id: 1,
  username: "admin",
  password: "password",
  name: "Nik Patel",
  email: "support@coderthemes.com",
  token: "valid-token-for-admin"
}
//
app.use(express.static(path.join(__dirname, "dist")))
app.use(cors())
app.use(express.json())
app.use("/api", ConfigurationRoutes)
app.use("/api", salesRoutes)
app.use("/api", reportsRoutes)
app.use("/api", authenticationRoutes)

// app.use(history())
app.get("/", (req, res) => res.redirect("http://localhost:3990/index.html"))
app.post("/api/session", AuthenticationController.login)
app.get("/api/session", async (req, res) => res.json(user))

app.listen(port, "0.0.0.0", () => console.log(`Example app listening on port ${port}!`))
