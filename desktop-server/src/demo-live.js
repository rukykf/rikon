const Store = require("electron-store")
const path = require("path")

const store = new Store()

const isDemo = function() {
  if (store.get("is_demo") === undefined) {
    store.set("is_demo", false)
  }
  return store.get("is_demo")
}

const switchToDemo = function() {
  store.set("is_demo", true)
}

const switchToLive = function() {
  store.set("is_demo", false)
}

module.exports = { isDemo, switchToLive, switchToDemo }
