const { DateTime } = require("luxon")
const db = require(".../../../../src/data-access/db-config")
const PointOfSaleController = require("../../../../src/modules/sales/PointOfSaleController")
const SalesItem = require("../../../../src/data-access/models/SalesItem")
const Department = require("../../../../src/data-access/models/Department")
const OrderItem = require("../../../../src/data-access/models/OrderItem")

let department
let salesItems = []

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
  await Department.query().delete()
  department = await Department.query().insert({
    name: "some department"
  })
})

beforeEach(async () => {
  salesItems = []
  await SalesItem.query().delete()
  await Department.query().delete()
})

afterAll(async () => {
  await Department.query().delete()
  await SalesItem.query().delete()
})

async function populateSalesItems() {
  let salesItem
  salesItem = await SalesItem.query().insert({
    name: "first item",
    unit: "bottle",
    price_per_unit: 500,
    department_id: department.id
  })
  salesItems.push(salesItem)

  let anotherDepartment = await Department.query().insert({ name: "another department" })
  salesItem = await SalesItem.query().insert({
    name: "second item",
    unit: "plate",
    price_per_unit: 900,
    department_id: anotherDepartment.id
  })
  salesItems.push(salesItem)

  // make the second sales item more popular than the first
  await OrderItem.query().insert({
    amount: 3000,
    order_id: 3,
    sales_item_id: salesItem.id,
    quantity: 50,
    unit: 30,
    name: "an item",
    date: DateTime.local().toISODate()
  })
}

test("PointOfSaleController.index successfully returns list of all available sales items ordered by popularity", async () => {
  await populateSalesItems()
  let output
  let req = {}
  let res = {
    json: jest.fn((items) => {
      output = items
    })
  }
  await PointOfSaleController.index(req, res)
  expect(output.length).toEqual(2)
  expect(output[0]).toMatchObject(salesItems[1])
  expect(output[1]).toMatchObject(salesItems[0])
})

test("PointOfSaleController.index successfully filters list of available sales items by department id", async () => {
  await populateSalesItems()
  let output
  let req = { query: { department_id: department.id } }
  let res = {
    json: jest.fn((items) => {
      output = items
    })
  }
  await PointOfSaleController.index(req, res)
  expect(output.length).toEqual(1)
  expect(output[0]).toMatchObject(salesItems[0])
})
