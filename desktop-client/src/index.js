const {app, BrowserWindow, Menu, ipcMain} = require("electron");
const path = require("path");
const Store = require("electron-store")
const { checkUrl } = require("check-url")
const store = new Store()

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) { // eslint-disable-line global-require
  app.quit();
}
let mainWindow

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 1200,
    webPreferences: {
      nodeIntegration: true
    }
  });

  const menu = Menu.buildFromTemplate([
    {
      label: "Rikon Configuration",
      submenu: [
        {
          label: "Configure IP and Port",
          id: "ip-and-port",
          click() {
            loadConfigurationPage(mainWindow)
          }
        },
        {
          label: "Back to App",
          id: "rikon-app",
          click() {
            loadRikonServerIPAddress(mainWindow)
          }
        },
      ]
    }
  ])

  Menu.setApplicationMenu(menu)

  // load the rikon server page, if it's been setup
  loadRikonServerIPAddress(mainWindow)

}

function loadConfigurationPage(mainWindow) {
  mainWindow.loadFile(path.join(__dirname, "index.html"))
}

function loadRikonServerIPAddress(mainWindow){
  let port = store.get("port", 80)
  let ipAddress = store.get("ipAddress")
  let httpScheme = store.get("httpScheme", "http")

  let url = `${httpScheme}://${ipAddress}:${port}`

  checkUrl(url).then(function(res){
    mainWindow.loadURL(url)
    mainWindow.maximize()
  }).catch((error) => {
    console.log("could not load page")
    mainWindow.maximize()
    mainWindow.loadFile(path.join(__dirname, "error-loading-url.html"))
  })
}

ipcMain.on("configure-rikon", (event, configData) => {
  store.set("ipAddress", configData.ipAddress)
  store.set("httpScheme", configData.httpScheme)
  store.set("port", configData.port)
  event.sender.send("successful-configuration")
})

ipcMain.on("reload-rikon-app", (event, args) => {
  console.log("reloading")
  loadRikonServerIPAddress(mainWindow)
})

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
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
