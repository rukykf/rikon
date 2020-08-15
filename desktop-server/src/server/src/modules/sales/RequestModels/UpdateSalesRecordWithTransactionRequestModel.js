const _ = require("lodash")
const ValidationException = require("../../Exceptions/ValidationException")

class UpdateSalesRecordWithTransactionRequestModel {
  constructor(req) {
    this.customer_details = {}
    this.credit_authorized_by = {}
    this.sellable_id = null
    this.sellable_type = null
    this.transaction_type = null
    this.sales_transaction_type = null
    this.amount = null
    this.full_name = req.get("full_name")
    this.department_id = _.toNumber(req.get("department_id"))

    if (_.has(req, ["body", "sellable_id"])) {
      this.sellable_id = req.body.sellable_id
    }

    if (_.has(req, ["body", "sellable_type"])) {
      this.sellable_type = req.body.sellable_type
    }

    if (_.has(req, ["body", "transaction_type"])) {
      this.transaction_type = req.body.transaction_type
    }

    if (_.has(req, ["body", "transaction_details", "customer_details"])) {
      this.customer_details = req.body.transaction_details.customer_details
    }

    if (_.has(req, ["body", "transaction_details", "credit_authorized_by"])) {
      this.credit_authorized_by = req.body.transaction_details.credit_authorized_by
    }

    if (_.has(req, ["body", "transaction_details", "transaction_type"])) {
      this.sales_transaction_type = _.toLower(req.body.transaction_details.transaction_type)
    }

    if (_.has(req, ["body", "transaction_details", "amount"])) {
      this.amount = _.toNumber(req.body.transaction_details.amount)
    }
  }

  validateSaleRecordUpdateRequest() {
    if (this.sellable_type == null) {
      throw new ValidationException(["sellable type is required"])
    }

    if (!_.includes(["order", "booking"], this.sellable_type)) {
      throw new ValidationException(["sellable type should be either order or booking"])
    }

    if (this.sellable_id == null) {
      throw new ValidationException(["sellable id is required"])
    }

    if (this.transaction_type == null) {
      throw new ValidationException(["transaction_type is required"])
    }

    if (!_.includes(["cash", "credit", "discount", "complementary", "company"], this.transaction_type)) {
      throw new ValidationException(["transaction type is invalid"])
    }
  }

  validateCashTransaction() {
    if (this.sales_transaction_type == null) {
      throw new ValidationException(["please provide valid payment method"])
    }

    if (this.amount == null) {
      throw new ValidationException(["please provide a valid amount"])
    }
  }

  validateCreditTransaction() {
    if (this.customer_details == null || _.isEqual(this.customer_details, {})) {
      throw new ValidationException(["please provide valid customer details"])
    }

    if (this.credit_authorized_by == null || _.isEqual(this.credit_authorized_by, {})) {
      throw new ValidationException(["please provide valid authorizer details"])
    }
  }
}

module.exports = UpdateSalesRecordWithTransactionRequestModel
