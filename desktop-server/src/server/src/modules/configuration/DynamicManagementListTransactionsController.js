const { ValidationError, NotFoundError } = require("objection")
const _ = require("lodash")
const ManagementListTransaction = require("../../data-access/models/ManagementListTransaction")
const ManagementListTransactionsIndexRequestModel = require("./RequestModels/ManagementListTransactionsIndexRequestModel")
const SaveManagementListTransactionRequestModel = require("./RequestModels/SaveManagementListTransactionRequestModel")
const ValidationException = require("../Exceptions/ValidationException")
const getValidationErrorMessages = require("../../utils/GetValidationErrorMessages")

module.exports = {
  async index(req, res) {
    try {
      let requestModel = new ManagementListTransactionsIndexRequestModel(req)

      let managementListTransactionsQueryBuilder = ManagementListTransaction.query()
        .where("created_at", ">=", requestModel.start_date)
        .andWhere("created_at", "<=", requestModel.end_date)
        .withGraphFetched("sale")
        .withGraphFetched("management_list_item")
        .orderBy("created_at", "desc")

      if (requestModel.management_list_item_id != null) {
        managementListTransactionsQueryBuilder.where(
          "management_list_item_id",
          "=",
          requestModel.management_list_item_id
        )
      }

      let managementListTransactions = await managementListTransactionsQueryBuilder.execute()

      if (requestModel.management_list_name != null) {
        managementListTransactions = managementListTransactions.filter((transaction) => {
          return transaction.management_list_item.list_name === requestModel.management_list_name
        })
      }

      if (requestModel.sales_status != null) {
        managementListTransactions = managementListTransactions.filter((transaction) => {
          return transaction.sale.status === requestModel.sales_status
        })
      }

      return res.json(managementListTransactions)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  },

  async create(req, res) {
    try {
      let createManagementListTransaction = new SaveManagementListTransactionRequestModel(req)

      await createManagementListTransaction.validateCreate()

      let managementListTransaction = await ManagementListTransaction.query().insert(createManagementListTransaction)

      return res.json(managementListTransaction)
    } catch (error) {
      if (error instanceof ValidationError) {
        let errorMessages = getValidationErrorMessages(error)
        return res.status(400).json({ messages: errorMessages })
      }

      if (error instanceof ValidationException) {
        return res.status(400).json({ messages: error.messages })
      }

      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  },

  async edit(req, res) {
    try {
      let updateManagementListTransactionModel = new SaveManagementListTransactionRequestModel(req)

      await updateManagementListTransactionModel.validateUpdate()

      let updatedManagementListTransaction = await ManagementListTransaction.query()
        .patchAndFetchById(_.toNumber(req.params.id), updateManagementListTransactionModel)
        .throwIfNotFound()

      return res.json(updatedManagementListTransaction)
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ messages: getValidationErrorMessages(error) })
      }

      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["the selected transaction was not found"] })
      }

      if (error instanceof ValidationException) {
        return res.status(400).json({ messages: error.messages })
      }

      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  },

  async show(req, res) {
    try {
      let managementListTransaction = await ManagementListTransaction.query()
        .findById(_.toNumber(req.params.id))
        .throwIfNotFound()

      return res.json(managementListTransaction)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["the selected transaction was not found"] })
      }

      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  },

  async delete(req, res) {
    try {
      let numDeletedRows = await ManagementListTransaction.query()
        .findById(_.toNumber(req.params.id))
        .throwIfNotFound()
        .patch({ active: false })
      return res.json({ messages: ["successfully deleted the selected transaction"] })
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["the selected transaction was not found"] })
      }

      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  }
}
