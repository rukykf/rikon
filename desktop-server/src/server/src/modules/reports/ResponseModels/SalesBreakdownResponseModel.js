class SalesBreakdownResponseModel {
  constructor(totalCashSales = 0, totalTransferSales = 0, totalPOSSales = 0, totalDebt = 0) {
    this.totalCashSales = totalCashSales
    this.totalTransferSales = totalTransferSales
    this.totalPOSSales = totalPOSSales
    this.totalDebt = totalDebt
  }
}

module.exports = SalesBreakdownResponseModel
