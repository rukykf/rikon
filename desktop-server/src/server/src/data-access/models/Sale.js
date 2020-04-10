const bookshelf = require("../db-config")
const SalesTransaction = require("./SalesTransaction")
const Booking = require("./Booking")
const Order = require("./Order")

const Sale = bookshelf.model("sales", {
  tableName: "sales",
  salesTransactions: function() {
    return this.hasMany(SalesTransaction)
  },
  details: function() {
    return this.morphTo("sellable", Booking, Order)
  }
})

module.exports = Sale
