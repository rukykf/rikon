const dotenv = require("dotenv")

const path = require("path")

dotenv.config({ path: path.join(__dirname, "../.env") })
const { app, BrowserWindow, Menu } = require("electron")
const server = require("./server/server")
const db = require("./server/src/data-access/db-setup")
const { runDBMigrations, setupAdminUser } = require("./setup-rikon-app")

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit()
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1800,
    height: 1200
  })

  const menu = Menu.buildFromTemplate([
    {
      label: "Rikon App Configuration",
      submenu: [
        {
          label: "Run Migrations",
          id: "migrations",
          click() {
            runDBMigrations()
          }
        },
        {
          label: "Setup Admin User",
          id: "admin-user",
          click() {
            setupAdminUser()
          }
        }
      ]
    }
  ])

  Menu.setApplicationMenu(menu)
  // and load the index.html of the app.
  mainWindow.maximize()
  mainWindow.loadURL("http://localhost:3990/")
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow)

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
