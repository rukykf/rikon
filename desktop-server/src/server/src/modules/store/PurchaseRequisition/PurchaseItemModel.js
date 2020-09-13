class PurchaseItemModel {
  constructor() {
    this.date = null
    this.store_item_id = null
    this.unit_id = null
    this.current_stock_balance = null
    this.quantity_requested = null
    this.current_market_price = null
    this.last_purchase_price = null
    this.estimated_total_cost = null
    this.remarks = null
  }
}

module.exports = PurchaseItemModel
