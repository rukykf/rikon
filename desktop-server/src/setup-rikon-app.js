const Store = require("electron-store")
const { Notification } = require("electron")
const path = require("path")
const db = require("./server/src/data-access/db-config")
const User = require("./server/src/data-access/models/User")
const Role = require("./server/src/data-access/models/Role")
const Permissions = require("./server/src/data-access/models/Permissions")

const store = new Store()

async function runDBMigrations() {
  try {
    await db.migrate.latest("./server/src/data-access/migrations")
    let notification = new Notification({ title: "Rikon DB Migrations", body: "Rikon DB Migrations Ran Successfully" })
    notification.show()
    console.log("migrations succeeded")
  } catch (error) {
    let notification = new Notification({
      title: "Rikon DB Migrations FAILURE",
      body: "Rikon DB Migrations Failed, contact the administrator"
    })
    notification.show()
    console.log("migrations failed")
  }
}

async function isServerSetup() {
  try {
    let role = await Role.query()
      .where("name", "=", "app-admin")
      .first()
    if (role != null) {
      return true
    }
    return false
  } catch (error) {
    return false
  }
}

async function setupAdminUser(adminUserData) {
  try {
    runDBMigrations().then(async () => {
      let role = await Role.query()
        .where("name", "=", "app-admin")
        .first()
      if (role != null) {
        let notification = new Notification({
          title: "Rikon Admin Setup",
          body: "Rikon Administrator Has Been Setup Already"
        })
        notification.show()
        return console.log("The Administrator has already been setup")
      }

      // the app-admin role has all permissions
      role = await Role.query().insert({
        name: "app-admin",
        permissions: Permissions
      })

      let adminUser = await User.query().insert({
        username: adminUserData.username,
        first_name: adminUserData.firstName,
        last_name: adminUserData.lastName,
        password: adminUserData.password,
        role_id: role.id
      })

      let notification = new Notification({
        title: "Rikon Admin Setup",
        body: "Rikon Administrator Was Setup Successfully"
      })
      notification.show()
      return console.log("Admin user has been setup successfully")
    })
  } catch (error) {
    let notification = new Notification({
      title: "Rikon Admin Setup FAILURE",
      body: "Rikon Administrator Setup Failed"
    })
    notification.show()
    console.log("something went wrong while setting up admin, ensure migrations have been run")
  }
}

module.exports = { runDBMigrations, setupAdminUser, isServerSetup }
