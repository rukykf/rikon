// Update with your config settings.

module.exports = {
  demo: {
    client: "mysql",
    connection: {
      host: "192.168.33.10",
      user: "root",
      password: "test",
      database: "rikon-db"
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
