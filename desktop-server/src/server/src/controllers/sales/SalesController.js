const _ = require("lodash")
const { DateTime } = require("luxon")
const { NotFoundError, ValidationError } = require("objection")
const Booking = require("../../data-access/models/Booking")
const Sale = require("../../data-access/models/Sale")
const Order = require("../../data-access/models/Order")
const SalesTransaction = require("../../data-access/models/SalesTransaction")

async function getSaleDetails(sale) {
  if (sale.merged_records != null) {
    let details = []
    let mergedRecords = await Sale.query().findByIds(sale.merged_records)

    for (let i = 0; i < mergedRecords.length; i++) {
      let record = mergedRecords[i]

      // eslint-disable-next-line no-await-in-loop
      let recordDetails = await getSaleDetails(record)
      details.push(recordDetails)
    }
    return details
  }

  let details = { type: "order" }
  if (sale.sellable_type === "booking") {
    details.type = "booking"
    let booking = await Booking.query()
      .findById(sale.sellable_id)
      .withGraphFetched("room.room_type")
    details.elements = booking
    return details
  }

  let order = await Order.query()
    .findById(sale.sellable_id)
    .withGraphFetched("order_items")
  details.elements = order
  return details
}

function isValidTransactionRequest(req) {
  let errorMessages = []

  if (_.get(req, ["body", "sellable_type"]) == null) {
    errorMessages.push("sellable_type is required")
  }

  if (!_.includes(["order", "booking"], _.get(req, ["body", "sellable_type"]))) {
    errorMessages.push("sellable_type should be either order or booking")
  }

  if (_.get(req, ["body", "sellable_id"]) == null) {
    errorMessages.push("sellable_id is required")
  }

  if (_.get(req, ["body", "transaction_type"]) == null) {
    errorMessages.push("transaction_type is required")
  }

  if (!_.includes(["cash", "credit", "discount"], _.get(req, ["body", "transaction_type"]))) {
    errorMessages.push("transaction_type is invalid")
  }

  if (_.get(req, ["body", "transaction_details"]) == null) {
    errorMessages.push("transaction details are required")
  }

  if (
    !_.includes(
      ["cash", "pos", "transfer", "discount", "complementary"],
      _.get(req, ["body", "transaction_details", "transaction_type"])
    )
  ) {
    errorMessages.push("a valid transaction_type is required")
  }

  if (
    req.body.transaction_type === "credit" &&
    _.get(req, ["body", "transaction_details", "customer_details"]) == null
  ) {
    errorMessages.push("you must provide valid customer details")
  }

  if (
    req.body.transaction_type === "credit" &&
    _.get(req, ["body", "transaction_details", "credit_authorized_by"]) == null
  ) {
    errorMessages.push("you must provide the name of whoever authorized this transaction")
  }

  return errorMessages
}

function getStatus(totalDue) {
  if (totalDue === 0) {
    return "paid"
  }

  if (totalDue > 0) {
    return "owing"
  }

  return "overpaid"
}

async function createSaleForSellable(req) {
  let sale
  if (req.body.sellable_type === "order") {
    let order = await Order.query()
      .findById(req.body.sellable_id)
      .throwIfNotFound()
    sale = await Sale.query().insert({
      total_paid: 0,
      total_amount: order.amount,
      total_due: order.amount,
      total_complementary: 0,
      sellable_type: "order",
      sellable_id: order.id,
      status: "owing",
      customer_details: req.body.transaction_details.customer_details,
      credit_authorized_by: req.body.transaction_details.credit_authorized_by
    })
  }
  if (req.body.sellable_type === "booking") {
    // Ensure the end date of the booking is at the most recent
    let booking = await Booking.query()
      .patchAndFetchById(req.body.sellable_id, {
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
      customer_details: req.body.customer_details,
      credit_authorized_by: req.body.credit_authorized_by
    })
  }
  return sale
}

async function updateSaleWithTransactionForSellable(req, sale) {
  let transaction = req.body.transaction_details
  let updatedSale

  transaction = await SalesTransaction.query().insert({
    sales_id: sale.id,
    date: DateTime.local().toISODate(),
    transaction_type: transaction.transaction_type,
    amount: transaction.amount,
    registered_by: req.get("full_name")
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
      total_complementary: sale.total_due,
      total_due: 0,
      status: "paid"
    })
  }

  return updatedSale
}

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
        .andWhere("created_at", ">=", startDate)
        .andWhere("created_at", "<=", endDate)

      if (_.get(req, ["query", "status"]) != null) {
        salesQueryBuilder.where("status", "=", req.query.status)
      }

      if (_.get(req, ["query", "sellable_type"]) != null) {
        salesQueryBuilder.where("sellable_type", "=", req.query.sellable_type)
      }

      let sales = await salesQueryBuilder
      let output = []
      for (let i = 0; i < sales.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        sales[i].details = await getSaleDetails(sales[i])
        output.push(sales[i])
      }
      return res.json(output)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async getCreditSales(req, res) {
    try {
      let sales = await Sale.query()
        .where("status", "=", "owing")
        .andWhere("active", "=", 1)
      let output = []
      for (let i = 0; i < sales.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        sales[i].details = await getSaleDetails(sales[i])
        output.push(sales[i])
      }
      return res.json(output)
    } catch (error) {
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async mergeSalesRecords(req, res) {
    try {
      let salesIDs = _.get(req, ["body", "ids_for_merge"])

      if (salesIDs.length === 0) {
        return res.json({ messages: ["merge completed successfully"] })
      }

      let newTotalAmount = 0
      let newTotalPaid = 0
      let newTotalComplementary = 0
      let newTotalDue = 0

      let records = await Sale.query()
        .findByIds(salesIDs)
        .throwIfNotFound()

      await Sale.query()
        .findByIds(salesIDs)
        .patch({ active: false })

      for (let i = 0; i < records.length; i++) {
        newTotalAmount += records[i].total_amount
        newTotalPaid += records[i].total_paid
        newTotalComplementary += records[i].total_complementary
        newTotalDue += records[i].total_due
      }
      let newSalesRecord = await Sale.query().insert({
        total_amount: newTotalAmount,
        total_paid: newTotalPaid,
        total_complementary: newTotalComplementary,
        total_due: newTotalDue,
        sellable_id: records[0].sellable_id,
        sellable_type: records[0].sellable_type,
        status: newTotalDue <= 0 ? "paid" : "owing",
        customer_details: records[0].customer_details,
        credit_authorized_by: records[0].credit_authorized_by,
        merged_records: salesIDs
      })

      return res.json(newSalesRecord)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["invalid record id"] })
      }

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
  async updateSalesRecordWithTransaction(req, res) {
    try {
      // Ensure all required variables are present in the request
      let validationErrorMessages = isValidTransactionRequest(req)
      if (validationErrorMessages.length !== 0) {
        return res.status(400).json({ messages: [validationErrorMessages] })
      }

      let sale = Sale.query()
        .where("sellable_id", "=", req.body.sellable_id)
        .andWhere("sellable_type", "=", req.body.sellable_type)
        .first()

      if (sale == null) {
        sale = await createSaleForSellable(req)
      }

      if (req.body.transaction_type !== "credit") {
        sale = await updateSaleWithTransactionForSellable(req, sale)
      }

      return res.json(sale)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["invalid sellable_id"] })
      }

      if (error instanceof ValidationError) {
        return res.status(400).json({ messages: ["invalid transaction data"] })
      }

      return res.status(500).json({ messages: ["something went wrong, please try again later"] })
    }
  }
}
