const _ = require("lodash")
const { NotFoundError } = require("objection")
const Sale = require("../../../data-access/models/Sale")
const ValidationException = require("../../Exceptions/ValidationException")
const ManagementList = require("../../../data-access/models/ManagementList")
const ManagementListTransaction = require("../../../data-access/models/ManagementListTransaction")

module.exports = class SaveManagementListTransactionRequestModel {
  constructor(req) {
    if (_.has(req, ["body", "management_list_item_id"])) {
      this.management_list_item_id = req.body.management_list_item_id
    }

    if (_.has(req, ["body", "sales_id"])) {
      this.sales_id = req.body.sales_id
    }

    if (_.has(req, ["body", "transaction_type"])) {
      this.transaction_type = req.body.transaction_type
    }

    if (_.has(req, ["body", "department_id"])) {
      this.department_id = req.body.department_id
    }
  }

  async validateNoDuplicates() {
    if (this.management_list_item_id != null && this.sales_id != null) {
      let existingTransaction = await ManagementListTransaction.query()
        .where("sales_id", this.sales_id)
        .andWhere("management_list_item_id", this.management_list_item_id)
        .first()

      if (existingTransaction == null) {
        return true
      }
    }

    return false
  }

  async validateCreate() {
    if (this.management_list_item_id == null) {
      throw new ValidationException(["please select a valid name from the management approved list"])
    }

    if (this.sales_id == null) {
      throw new ValidationException(["please provide a sales id"])
    }

    await this.validateManagementListItemId()

    await this.validateSalesId()
  }

  async validateUpdate() {
    if (this.management_list_item_id != null) {
      await this.validateManagementListItemId()
    }

    if (this.sales_id != null) {
      await this.validateSalesId()
    }
  }

  async validateManagementListItemId() {
    try {
      let managementListItem = await ManagementList.query()
        .findById(this.management_list_item_id)
        .throwIfNotFound()
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ValidationException(["please select a valid name from the management approved list"])
      }
    }
  }

  async validateSalesId() {
    try {
      let sale = await Sale.query()
        .findById(this.sales_id)
        .throwIfNotFound()
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ValidationException(["please select a valid sales record"])
      }
    }
  }
}
