const sqlite3 = require("sqlite3").verbose()

const db = {
  live: null,
  demo: null
}

db.live = new sqlite3.Database("C:\\rikon\\live.db")
db.demo = new sqlite3.Database("C:\\rikon\\demo.db")

module.exports = db
