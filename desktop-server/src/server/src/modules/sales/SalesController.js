const _ = require("lodash")
const { DateTime } = require("luxon")
const { NotFoundError, ValidationError } = require("objection")
const Booking = require("../../data-access/models/Booking")
const Sale = require("../../data-access/models/Sale")
const Order = require("../../data-access/models/Order")
const SalesTransaction = require("../../data-access/models/SalesTransaction")
const logger = require("../../utils/Logger")
const ValidationException = require("../Exceptions/ValidationException")
const UpdateSalesRecordWithTransactionRequestModel = require("./RequestModels/UpdateSalesRecordWithTransactionRequestModel")

module.exports = {
  async index(req, res) {
    try {
      let startDate = _.get(req, ["query", "start_date"])
        ? req.query.start_date
        : DateTime.local()
            .minus({ days: 90 })
            .toISODate()
      let endDate = _.get(req, ["query", "end_date"]) ? req.query.end_date : DateTime.local().toISODate()

      let salesQueryBuilder = Sale.query()
        .where("active", "=", 1)
        .andWhere("item_created_at", ">=", startDate)
        .andWhere("item_created_at", "<=", endDate)
        .withGraphFetched("sales_transactions")
        .withGraphFetched("booking.room")
        .withGraphFetched("order.order_items")
        .orderBy("created_at", "desc")

      if (_.get(req, ["query", "department_id"]) != null) {
        salesQueryBuilder.andWhere("department_id", "=", req.query.department_id)
      }

      if (_.get(req, ["query", "status"]) != null) {
        salesQueryBuilder.andWhere("status", "=", req.query.status)
      }

      if (_.get(req, ["query", "sellable_type"]) != null) {
        salesQueryBuilder.where("sellable_type", "=", req.query.sellable_type)
      }

      let sales = await salesQueryBuilder
      return res.json(sales)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  /**
   * Expecting the body of the request to contain:
   *
   * sellable_type
   * sellable_id
   * transaction_type (cash or credit)
   * transaction_details
   *
   * @param req
   * @param res
   */
  async updateSalesRecordWithTransactionForSellable(req, res) {
    try {
      // Ensure all required variables are present in the request
      let updateSalesRecordRequestModel = new UpdateSalesRecordWithTransactionRequestModel(req)
      updateSalesRecordRequestModel.validateSaleRecordUpdateRequest()

      let sale = await Sale.query()
        .where("sellable_id", "=", updateSalesRecordRequestModel.sellable_id)
        .andWhere("sellable_type", "=", updateSalesRecordRequestModel.sellable_type)
        .first()

      if (sale == null) {
        sale = await createSaleForSellable(updateSalesRecordRequestModel)
      }

      if (
        updateSalesRecordRequestModel.transaction_type !== "credit" &&
        updateSalesRecordRequestModel.transaction_type !== "company"
      ) {
        sale = await updateSaleRecordWithTransaction(updateSalesRecordRequestModel, sale)
      }

      if (updateSalesRecordRequestModel.transaction_type === "credit") {
        updateSalesRecordRequestModel.validateCreditTransaction()
      }

      sale = await Sale.query().patchAndFetchById(sale.id, {
        customer_details: updateSalesRecordRequestModel.customer_details,
        credit_authorized_by: updateSalesRecordRequestModel.credit_authorized_by
      })

      return res.json(sale)
    } catch (error) {
      logger.logRequestError(req, error, "could not update sales record")

      if (error instanceof ValidationException) {
        return res.status(400).json({ messages: error.messages })
      }

      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["invalid sellable_id"] })
      }

      if (error instanceof ValidationError) {
        return res.status(400).json({ messages: ["invalid transaction data"] })
      }

      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  },

  async updateSalesRecordWithTransaction(req, res) {
    try {
      let sale = await Sale.query().findById(_.toNumber(req.params.id))
      let updatedSalesRecordWithTransactionModel = new UpdateSalesRecordWithTransactionRequestModel(req)
      sale = await updateSaleRecordWithTransaction(updatedSalesRecordWithTransactionModel, sale)
      return res.json(sale)
    } catch (error) {
      logger.logRequestError(req, error, "could not update sales record with transaction")
      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  },

  async revertSalesTransactionForSalesRecord(req, res) {
    try {
      let salesTransaction = await SalesTransaction.query()
        .findById(_.toNumber(req.params.id))
        .throwIfNotFound()
      if (salesTransaction.transaction_type === "complementary") {
        return res.status(400).json({ messages: ["you cannot reverse a complementary transaction"] })
      }

      let sale = await Sale.query().findById(salesTransaction.sales_id)

      if (salesTransaction.transaction_type === "discount") {
        let newTotalComplementary = sale.total_complementary - salesTransaction.amount
        let newTotalDue = sale.total_amount - (newTotalComplementary + sale.total_paid)
        let newSale = await Sale.query().patchAndFetchById(sale.id, {
          total_complementary: newTotalComplementary,
          total_due: newTotalDue,
          status: getStatus(newTotalDue)
        })
        let reversedSalesTransaction = await SalesTransaction.query().insert({
          sales_id: sale.id,
          transaction_type: "reverse-discount",
          amount: salesTransaction.amount,
          registered_by: req.get("full_name")
        })
        await SalesTransaction.query()
          .findById(salesTransaction.id)
          .patch({ active: false })
        return res.json(newSale)
      }

      if (_.includes(["pos", "transfer", "cash"], salesTransaction.transaction_type)) {
        let newTotalPaid = sale.total_paid - salesTransaction.amount
        let newTotalDue = sale.total_amount - (newTotalPaid + sale.total_complementary)
        let newSale = await Sale.query().patchAndFetchById(sale.id, {
          total_paid: newTotalPaid,
          total_due: newTotalDue,
          status: getStatus(newTotalDue)
        })
        let reversedSalesTransaction = await SalesTransaction.query().insert({
          sales_id: sale.id,
          transaction_type: `reverse-${salesTransaction.transaction_type.toLowerCase()}`,
          amount: salesTransaction.amount,
          registered_by: req.get("full_name")
        })

        await SalesTransaction.query()
          .findById(salesTransaction.id)
          .patch({ active: false })
        return res.json(newSale)
      }

      return res.status(400).json({ messages: ["could not revert selected transaction"] })
    } catch (error) {
      logger.logRequestError(req, error, "could not revert sales-transaction")

      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not find selected transaction"] })
      }
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async getSalesTransactionsForSalesRecord(req, res) {
    try {
      let salesTransactions = await SalesTransaction.query().where("sales_id", "=", _.toNumber(req.params.id))
      return res.json(salesTransactions)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  }
}

// private methods
function getStatus(totalDue) {
  if (totalDue === 0) {
    return "paid"
  }

  if (totalDue > 0) {
    return "owing"
  }

  return "overpaid"
}

async function createSaleForSellable(createSaleForSellableModel) {
  let sale
  if (createSaleForSellableModel.sellable_type === "order") {
    let order = await Order.query()
      .findById(createSaleForSellableModel.sellable_id)
      .throwIfNotFound()
    sale = await Sale.query().insert({
      total_paid: 0,
      total_amount: order.amount,
      total_due: order.amount,
      total_complementary: 0,
      sellable_type: "order",
      sellable_id: order.id,
      status: "owing",
      item_created_at: order.created_at,
      department_id: createSaleForSellableModel.department_id,
      transaction_type: createSaleForSellableModel.transaction_type,
      customer_details: createSaleForSellableModel.customer_details,
      credit_authorized_by: createSaleForSellableModel.credit_authorized_by
    })
  }
  if (createSaleForSellableModel.sellable_type === "booking") {
    // Ensure the end date of the booking is at the most recent
    let booking = await Booking.query()
      .patchAndFetchById(createSaleForSellableModel.sellable_id, {
        end_date: DateTime.local().toISODate()
      })
      .throwIfNotFound()
    let totalAmount = Booking.getNumNights(booking.start_date, booking.end_date) * booking.price_per_night
    sale = await Sale.query().insert({
      total_paid: 0,
      total_amount: totalAmount,
      total_due: totalAmount,
      total_complementary: 0,
      sellable_type: "booking",
      sellable_id: booking.id,
      status: "owing",
      item_created_at: booking.created_at,
      department_id: createSaleForSellableModel.department_id,
      transaction_type: createSaleForSellableModel.transaction_type,
      customer_details: createSaleForSellableModel.customer_details,
      credit_authorized_by: createSaleForSellableModel.credit_authorized_by
    })
  }
  return sale
}

async function updateSaleRecordWithTransaction(updateSaleRecordWithTransactionModel, sale) {
  let transaction = {
    sales_transaction_type: updateSaleRecordWithTransactionModel.sales_transaction_type,
    amount: updateSaleRecordWithTransactionModel.amount
  }

  let updatedSale

  transaction = await SalesTransaction.query().insert({
    sales_id: sale.id,
    date: DateTime.local().toISODate(),
    transaction_type: updateSaleRecordWithTransactionModel.sales_transaction_type,
    amount: updateSaleRecordWithTransactionModel.amount,
    registered_by: updateSaleRecordWithTransactionModel.full_name
  })

  if (_.includes(["cash", "pos", "transfer"], transaction.transaction_type)) {
    let totalPayment = sale.total_paid + transaction.amount
    let totalDue = sale.total_amount - (totalPayment + sale.total_complementary)

    updatedSale = await Sale.query().patchAndFetchById(sale.id, {
      total_paid: totalPayment,
      total_due: totalDue >= 0 ? totalDue : 0,
      status: getStatus(totalDue)
    })
  }

  if (transaction.transaction_type === "discount") {
    let totalComplementary = sale.total_complementary + transaction.amount
    let totalDue = sale.total_amount - (totalComplementary + sale.total_paid)

    updatedSale = await Sale.query().patchAndFetchById(sale.id, {
      total_complementary: totalComplementary,
      total_due: totalDue >= 0 ? totalDue : 0,
      status: getStatus(totalDue)
    })
  }

  if (transaction.transaction_type === "complementary") {
    updatedSale = await Sale.query().patchAndFetchById(sale.id, {
      total_complementary: sale.total_due + sale.total_complementary,
      total_due: 0,
      status: "paid"
    })

    // ensure the transaction reflects the amount that was forgiven
    await SalesTransaction.query().patchAndFetchById(transaction.id, {
      amount: updatedSale.total_complementary
    })
  }

  return updatedSale
}
