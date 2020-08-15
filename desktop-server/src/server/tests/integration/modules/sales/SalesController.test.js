const { DateTime } = require("luxon")
const db = require(".../../../../src/data-access/db-config")
const SalesController = require("../../../../src/modules/sales/SalesController")
const Sale = require("../../../../src/data-access/models/Sale")
const SalesTransaction = require("../../../../src/data-access/models/SalesTransaction")
const Booking = require("../../../../src/data-access/models/Booking")
const Order = require("../../../../src/data-access/models/Order")

let booking
let order

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
  booking = await Booking.query().insert({
    start_date: DateTime.local()
      .minus({ days: 3 })
      .toISODate(),
    created_at: DateTime.local()
      .minus({ days: 3 })
      .toISODate(),
    end_date: DateTime.local().toISODate(),
    status: "open",
    price_per_night: 5000,
    room_id: 2,
    customer_details: { name: "some customer name" }
  })
  order = await Order.query().insert({
    amount: 20000,
    created_at: DateTime.local().toISODate(),
    updated_at: DateTime.local().toISODate(),
    status: "pending",
    departments: ["kitchen"],
    placed_by: { name: "someone placed this" },
    delivered_by: { name: "some name" }
  })
})

beforeEach(async () => {
  await Sale.query().delete()
  await SalesTransaction.query().delete()
})

afterAll(async () => {
  await Sale.query().delete()
  await SalesTransaction.query().delete()
})

async function populateSales() {
  // Requests to the index order by date so... just keep that in mind
  let sales = []

  // one old fully paid sale
  let sale = await Sale.query().insert({
    created_at: DateTime.local()
      .minus({ days: 100 })
      .toISODate(),
    updated_at: DateTime.local()
      .minus({ days: 100 })
      .toISODate(),
    sellable_id: order.id,
    sellable_type: "order",
    status: "paid",
    total_amount: 10000,
    total_paid: 10000,
    transaction_type: "cash",
    total_complementary: 0,
    department_id: 1,
    total_due: 0
  })
  sales.push(sale)

  // one recent fully paid sale
  sale = await Sale.query().insert({
    created_at: DateTime.local()
      .minus({ days: 12 })
      .toISODate(),
    updated_at: DateTime.local()
      .minus({ days: 12 })
      .toISODate(),
    sellable_id: order.id,
    sellable_type: "order",
    status: "paid",
    total_amount: 10000,
    total_paid: 10000,
    total_complementary: 0,
    department_id: 1,
    transaction_type: "cash",
    total_due: 0
  })
  sales.push(sale)

  // one recent credit sale
  sale = await Sale.query().insert({
    created_at: DateTime.local()
      .minus({ days: 4 })
      .toISODate(),
    updated_at: DateTime.local()
      .minus({ days: 4 })
      .toISODate(),
    sellable_id: booking.id,
    sellable_type: "booking",
    status: "owing",
    total_amount: 10000,
    total_paid: 0,
    total_complementary: 0,
    total_due: 10000,
    department_id: 1,
    transaction_type: "credit",
    credit_authorized_by: { name: "authorizing personnel" },
    customer_details: { name: "some name" }
  })
  sales.push(sale)

  // one recent partial credit sale
  sale = await Sale.query().insert({
    created_at: DateTime.local()
      .minus({ days: 1 })
      .toISODate(),
    updated_at: DateTime.local()
      .minus({ days: 1 })
      .toISODate(),
    sellable_id: booking.id,
    sellable_type: "booking",
    status: "owing",
    total_amount: 10000,
    total_paid: 0,
    total_complementary: 5000,
    total_due: 5000,
    department_id: 1,
    transaction_type: "credit",
    credit_authorized_by: { name: "authorizing personnel" },
    customer_details: { name: "another name" }
  })
  sales.push(sale)

  // one merged sale
  sale = await Sale.query().insert({
    created_at: DateTime.local()
      .minus({ days: 1 })
      .toISODate(),
    updated_at: DateTime.local()
      .minus({ days: 1 })
      .toISODate(),
    sellable_id: booking.id,
    sellable_type: "booking",
    status: "owing",
    total_amount: 10000,
    total_paid: 0,
    total_complementary: 5000,
    total_due: 5000,
    department_id: 1,
    transaction_type: "credit",
    credit_authorized_by: { name: "authorizing personnel" },
    customer_details: { name: "another name" },
    merged_records: [sales[2].id, sales[3].id]
  })
  sales.push(sale)
  return sales
}

test("SalesController.index returns list of active sales in the past 90 days by default", async () => {
  let sales = await populateSales()
  let req = {}
  let output
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }
  await SalesController.index(req, res)
  expect(output.length).toEqual(4)
  expect(output[0]).toMatchObject(sales[3])
  expect(output[1]).toMatchObject(sales[4])
  expect(output[2]).toMatchObject(sales[2])
  expect(output[3]).toMatchObject(sales[1])
})

test("SalesController.index successfully filters list of sales by date", async () => {
  let sales = await populateSales()
  let req = {
    query: {
      start_date: DateTime.local()
        .minus({ days: 120 })
        .toISODate(),
      end_date: DateTime.local()
        .minus({ days: 90 })
        .toISODate()
    }
  }
  let output
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }
  await SalesController.index(req, res)
  expect(output.length).toEqual(1)
  expect(output[0]).toMatchObject(sales[0])
})

test("SalesController.index successfully filters list of sales by status", async () => {
  let sales = await populateSales()
  let req = {
    query: {
      status: "paid"
    }
  }
  let output
  let res = {
    json: jest.fn((args) => {
      output = args
    })
  }
  await SalesController.index(req, res)
  expect(output.length).toEqual(1)
  expect(output[0]).toMatchObject(sales[1])
})

test("SalesController.updateSalesRecordWithTransactionForSellable succeeds with cash transaction", async () => {
  let req = {
    body: {
      sellable_type: "booking",
      sellable_id: booking.id,
      transaction_type: "cash",
      transaction_details: {
        amount: 5000,
        transaction_type: "pos"
      }
    },
    get: jest.fn((args) => {
      if (args === "full_name") {
        return "some name"
      }
      return 1
    })
  }
  let res = { json: jest.fn() }
  await SalesController.updateSalesRecordWithTransactionForSellable(req, res)
  let sale = await Sale.query().first()
  let salesTransaction = await SalesTransaction.query().first()
  expect(sale.total_amount).toEqual(15000)
  expect(sale.total_paid).toEqual(5000)
  expect(sale.total_complementary).toEqual(0)
  expect(sale.total_due).toEqual(10000)
  expect(sale.sellable_id).toEqual(booking.id)
  expect(sale.sellable_type).toEqual("booking")
  expect(sale.status).toEqual("owing")
  expect(salesTransaction.amount).toEqual(5000)
  expect(salesTransaction.transaction_type).toEqual("pos")
  expect(salesTransaction.registered_by).toEqual("some name")

  req.body.transaction_details = {
    amount: 5000,
    transaction_type: "discount"
  }
  await SalesController.updateSalesRecordWithTransactionForSellable(req, res)
  sale = await Sale.query().first()
  expect(sale.total_amount).toEqual(15000)
  expect(sale.total_paid).toEqual(5000)
  expect(sale.total_complementary).toEqual(5000)
  expect(sale.total_due).toEqual(5000)
  expect(sale.sellable_id).toEqual(booking.id)
  expect(sale.sellable_type).toEqual("booking")
  expect(sale.status).toEqual("owing")

  req.body.transaction_details = {
    amount: 10000,
    transaction_type: "transfer"
  }
  await SalesController.updateSalesRecordWithTransactionForSellable(req, res)
  sale = await Sale.query().first()
  expect(sale.total_amount).toEqual(15000)
  expect(sale.total_paid).toEqual(15000)
  expect(sale.total_complementary).toEqual(5000)
  expect(sale.total_due).toEqual(0)
  expect(sale.sellable_id).toEqual(booking.id)
  expect(sale.sellable_type).toEqual("booking")
  expect(sale.status).toEqual("overpaid")
})

test("SalesController.updateSalesRecordWithTransactionForSellable succeeds with discount transaction", async () => {
  let req = {
    body: {
      sellable_type: "order",
      sellable_id: order.id,
      transaction_type: "cash",
      transaction_details: {
        amount: 15000,
        transaction_type: "discount"
      }
    },
    get: jest.fn((args) => {
      if (args === "full_name") {
        return "some name"
      }
      return 1
    })
  }

  let res = { json: jest.fn() }
  await SalesController.updateSalesRecordWithTransactionForSellable(req, res)
  let sale = await Sale.query().first()
  let salesTransaction = await SalesTransaction.query().first()
  expect(sale.total_amount).toEqual(20000)
  expect(sale.total_paid).toEqual(0)
  expect(sale.total_complementary).toEqual(15000)
  expect(sale.total_due).toEqual(5000)
  expect(sale.sellable_id).toEqual(order.id)
  expect(sale.sellable_type).toEqual("order")
  expect(sale.status).toEqual("owing")
  expect(salesTransaction.amount).toEqual(15000)
  expect(salesTransaction.transaction_type).toEqual("discount")
  expect(salesTransaction.registered_by).toEqual("some name")

  req.body.transaction_details = {
    amount: 5000,
    transaction_type: "cash"
  }
  await SalesController.updateSalesRecordWithTransactionForSellable(req, res)
  sale = await Sale.query().first()
  expect(sale.total_amount).toEqual(20000)
  expect(sale.total_paid).toEqual(5000)
  expect(sale.total_complementary).toEqual(15000)
  expect(sale.total_due).toEqual(0)
  expect(sale.sellable_id).toEqual(order.id)
  expect(sale.sellable_type).toEqual("order")
  expect(sale.status).toEqual("paid")
  expect(salesTransaction.amount).toEqual(15000)
})

test("SalesController.updateSalesRecordWithTransactionForSellable succeeds with complementary transaction", async () => {
  await Sale.query().insert({
    total_amount: 25000,
    total_paid: 5000,
    total_complementary: 5000,
    total_due: 15000,
    sellable_type: "order",
    sellable_id: order.id,
    transaction_type: "complementary",
    department_id: 1,
    status: "owing"
  })

  let req = {
    body: {
      sellable_type: "order",
      sellable_id: order.id,
      transaction_type: "cash",
      transaction_details: {
        amount: 15000,
        transaction_type: "complementary"
      }
    },
    get: jest.fn((args) => {
      if (args === "full_name") {
        return "some name"
      }
      return 1
    })
  }

  let res = { json: jest.fn() }
  await SalesController.updateSalesRecordWithTransactionForSellable(req, res)
  let sale = await Sale.query().first()
  let salesTransaction = await SalesTransaction.query().first()
  expect(sale.total_amount).toEqual(25000)
  expect(sale.total_paid).toEqual(5000)
  expect(sale.total_complementary).toEqual(20000)
  expect(sale.total_due).toEqual(0)
  expect(sale.sellable_id).toEqual(order.id)
  expect(sale.sellable_type).toEqual("order")
  expect(sale.status).toEqual("paid")
  expect(salesTransaction.amount).toEqual(20000)
  expect(salesTransaction.transaction_type).toEqual("complementary")
  expect(salesTransaction.registered_by).toEqual("some name")
})

test("SalesController.updateSalesRecordWithTransactionForSellable succeeds with valid credit transaction", async () => {
  let sale = await Sale.query().insert({
    total_amount: 20000,
    total_paid: 5000,
    total_complementary: 0,
    total_due: 15000,
    sellable_type: "order",
    sellable_id: order.id,
    transaction_type: "credit",
    department_id: 1,
    status: "owing"
  })
  let req = {
    get: jest.fn((args) => {
      if (args === "full_name") {
        return "some name"
      }
      return 1
    }),
    body: {
      sellable_type: "order",
      sellable_id: order.id,
      transaction_type: "credit",
      transaction_details: {
        credit_authorized_by: { name: "some name" },
        customer_details: { name: "some customer" }
      }
    }
  }

  let res = { json: jest.fn() }
  await SalesController.updateSalesRecordWithTransactionForSellable(req, res)
  sale = await Sale.query().findById(sale.id)
  expect(sale.credit_authorized_by).toEqual({ name: "some name" })
  expect(sale.customer_details).toEqual({ name: "some customer" })
  expect(sale.total_amount).toEqual(20000)

  req.body = {
    sellable_type: "booking",
    sellable_id: booking.id,
    transaction_type: "credit",
    transaction_details: {
      credit_authorized_by: { name: "some name" },
      customer_details: { name: "some customer" }
    }
  }
  await SalesController.updateSalesRecordWithTransactionForSellable(req, res)
  sale = await Sale.query()
    .where("sellable_type", "=", "booking")
    .first()
  expect(sale.credit_authorized_by).toEqual({ name: "some name" })
  expect(sale.customer_details).toEqual({ name: "some customer" })
  expect(sale.total_amount).toEqual(15000)
})

test("SalesController.updateSalesRecordWithTransactionForSellable fails with invalid credit transaction", async () => {
  let req = {
    get: jest.fn((args) => {
      if (args === "full_name") {
        return "some name"
      }
      return 1
    }),
    body: {
      sellable_type: "order",
      sellable_id: order.id,
      transaction_type: "credit",
      transaction_details: {
        credit_authorized_by: { name: "some name" }
      }
    }
  }

  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()

  await SalesController.updateSalesRecordWithTransactionForSellable(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["please provide valid customer details"] })

  req.body = {
    sellable_type: "order",
    sellable_id: order.id,
    transaction_type: "credit",
    transaction_details: {}
  }

  await SalesController.updateSalesRecordWithTransactionForSellable(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({
    messages: ["please provide valid customer details"]
  })
})

test("SalesController.updateSalesRecordWithTransactionForSellable returns error messages when passed invalid transaction data", async () => {
  let req = {
    body: {
      sellable_type: "booking",
      sellable_id: booking.id,
      transaction_type: "cash",
      transaction_details: {
        transaction_type: "cash"
      }
    },
    get: jest.fn((args) => {
      if (args === "full_name") {
        return "some name"
      }
      return 1
    })
  }

  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()

  await SalesController.updateSalesRecordWithTransactionForSellable(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["invalid transaction data"] })
})

test("SalesController.updateSalesRecordWithTransactionForSellable returns error messages when passed invalid sellable_id", async () => {
  let req = {
    get: jest.fn((args) => {
      if (args === "full_name") {
        return "some name"
      }
      return 1
    }),
    body: {
      sellable_type: "order",
      sellable_id: 29,
      transaction_type: "credit",
      transaction_details: {
        credit_authorized_by: { name: "some name" },
        customer_details: { name: "some customer" }
      }
    }
  }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()

  await SalesController.updateSalesRecordWithTransactionForSellable(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["invalid sellable_id"] })
})

test("SalesController.revertSalesTransactionForSalesRecord successfully reverts discount transactions", async () => {
  let sale = await Sale.query().insert({
    total_amount: 20000,
    total_paid: 0,
    total_complementary: 5000,
    total_due: 15000,
    sellable_type: "order",
    sellable_id: order.id,
    transaction_type: "discount",
    department_id: 1,
    status: "owing"
  })

  let salesTransaction = await SalesTransaction.query().insert({
    sales_id: sale.id,
    transaction_type: "discount",
    amount: 5000,
    registered_by: "someone's name"
  })

  let req = {
    params: { id: salesTransaction.id },
    get: jest.fn((args) => {
      if (args === "full_name") {
        return "some name"
      }
      return 1
    })
  }

  let res = { json: jest.fn() }
  await SalesController.revertSalesTransactionForSalesRecord(req, res)
  sale = await Sale.query().findById(salesTransaction.sales_id)
  salesTransaction = await SalesTransaction.query()
    .where("transaction_type", "=", "reverse-discount")
    .first()
  expect(sale.total_due).toEqual(20000)
  expect(sale.total_complementary).toEqual(0)
  expect(salesTransaction.amount).toEqual(5000)
})

test("SalesController.revertSalesTransactionForSalesRecord successfully reverts cash transactions", async () => {
  let sale = await Sale.query().insert({
    total_amount: 20000,
    total_paid: 5000,
    total_complementary: 5000,
    total_due: 10000,
    sellable_type: "order",
    sellable_id: order.id,
    transaction_type: "cash",
    department_id: 1,
    status: "owing"
  })

  let salesTransaction = await SalesTransaction.query().insert({
    sales_id: sale.id,
    transaction_type: "pos",
    amount: 5000,
    registered_by: "someone's name"
  })

  let req = {
    params: { id: salesTransaction.id },
    get: jest.fn((args) => {
      if (args === "full_name") {
        return "some name"
      }
      return 1
    })
  }
  let res = { json: jest.fn() }
  await SalesController.revertSalesTransactionForSalesRecord(req, res)
  sale = await Sale.query().findById(salesTransaction.sales_id)
  salesTransaction = await SalesTransaction.query()
    .where("transaction_type", "=", "reverse-pos")
    .first()
  expect(sale.total_due).toEqual(15000)
  expect(sale.total_complementary).toEqual(5000)
  expect(sale.total_paid).toEqual(0)
  expect(salesTransaction.amount).toEqual(5000)
})

test("SalesController.revertSalesTransactionForSalesRecord returns error message when attempting to revert complementary transactions", async () => {
  let sale = await Sale.query().insert({
    total_amount: 20000,
    total_paid: 0,
    total_complementary: 20000,
    total_due: 0,
    sellable_type: "order",
    sellable_id: order.id,
    transaction_type: "complementary",
    department_id: 1,
    status: "owing"
  })

  let salesTransaction = await SalesTransaction.query().insert({
    sales_id: sale.id,
    transaction_type: "complementary",
    amount: 5000,
    registered_by: "someone's name"
  })

  let req = {
    params: { id: salesTransaction.id },
    get: jest.fn((args) => {
      if (args === "full_name") {
        return "some name"
      }
      return 1
    })
  }

  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await SalesController.revertSalesTransactionForSalesRecord(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["you cannot reverse a complementary transaction"] })
})

test("SalesController.revertSalesTransactionForSalesRecord returns error message when passed invalid id", async () => {
  let req = {
    params: { id: 48 },
    get: jest.fn((args) => {
      if (args === "full_name") {
        return "some name"
      }
      return 1
    })
  }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()

  await SalesController.revertSalesTransactionForSalesRecord(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({ messages: ["could not find selected transaction"] })
})
