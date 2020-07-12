const cors = require("cors")
const path = require("path")

if (process.env.NODE_ENV == null) {
  const dotenv = require("dotenv")
  dotenv.config({ path: path.join(__dirname, "../../.env") })
}

const express = require("express")
const history = require("connect-history-api-fallback")
const AuthenticationController = require("./src/modules/authentication/AuthenticationController")
const ConfigurationRoutes = require("./src/routes/configuration-module")
const salesRoutes = require("./src/routes/sales-module")
const reportsRoutes = require("./src/routes/reports-module")
const authenticationRoutes = require("./src/routes/authentication-module")

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
app.use(express.static(path.join(__dirname, "assets")))
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

app.listen(port, "0.0.0.0", () =>
  console.log(`Example app listening on port ${port}! with environment ${process.env.NODE_ENV}`)
)
