const bookshelf = require("../db-config")
const Sale = require("./Sale")

const SalesTransaction = bookshelf.model("SalesTransaction", {
  tableName: "sales_transactions",
  hasTimestamps: true,
  sale: function() {
    return this.belongsTo(Sale)
  }
})

module.exports = SalesTransaction
