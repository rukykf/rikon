class SalesBreakdownResponseModel {
  constructor(
    totalCashSales = 0,
    totalTransferSales = 0,
    totalPOSSales = 0,
    totalDebt = 0,
    totalDiscount = 0,
    totalComplementary = 0,
    totalCompany = 0,
    totalSales = 0
  ) {
    this.totalCashSales = totalCashSales
    this.totalTransferSales = totalTransferSales
    this.totalPOSSales = totalPOSSales
    this.totalDebt = totalDebt
    this.totalDiscount = totalDiscount
    this.totalCompany = totalCompany
    this.totalComplementary = totalComplementary
    this.totalSales = totalSales
  }
}

module.exports = SalesBreakdownResponseModel
