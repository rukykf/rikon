// Update with your config settings.
const path = require("path")

module.exports = {
  demo: {
    client: "mysql",
    connection: {
      host: "192.168.33.10",
      user: "root",
      password: "test",
      database: "rikon-db"
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, "src/server/src/data-access/migrations")
    },
    seeds: {
      directory: path.join(__dirname, "src/server/src/data-access/seeds")
    }
  },

  testing: {
    client: "sqlite3",
    connection: ":memory:",
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, "src/server/src/data-access/migrations")
    },
    seeds: {
      directory: path.join(__dirname, "src/server/src/data-access/seeds")
    }
  },

  live: {
    client: "sqlite3",
    connection: {
      filename: "C:\\rikon\\live.db"
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, "src/server/src/data-access/migrations")
    },
    seeds: {
      directory: path.join(__dirname, "src/server/src/data-access/seeds")
    }
  }
}
