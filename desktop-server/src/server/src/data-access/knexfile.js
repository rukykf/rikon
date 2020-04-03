// Update with your config settings.

module.exports = {
  demo: {
    client: "sqlite3",
    connection: {
      filename: "C:\\rikon\\demo.db"
    },
    useNullAsDefault: true
  },
  live: {
    client: "sqlite3",
    connection: {
      filename: "C:\\rikon\\live.db"
    },
    useNullAsDefault: true
  }
}
