const express = require("express")
const history = require("connect-history-api-fallback")
const path = require("path")

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

app.use(express.static(path.join(__dirname, "dist")))
app.use(history())

app.get("/", (req, res) => res.redirect("http://localhost:3000/index.html"))

app.post("/api/session", (req, res) => res.json(user))
app.get("/api/session", (req, res) => res.json(user))

app.listen(port, "0.0.0.0", () => console.log(`Example app listening on port ${port}!`))
