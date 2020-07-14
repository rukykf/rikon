const Authorize = require("../../../src/middleware/Authorize")
let User = require("../../../src/data-access/models/User")

jest.mock("../../../src/routes/route-permissions", () => {
  return {
    "/users": { GET: "can-list-users", POST: "can-create-users" },
    "/users/:id": { GET: "can-show-user", POST: "can-delete-users" }
  }
})
jest.mock("../../../src/data-access/models/User")

beforeAll(() => {
  User.query = jest.fn()
  User.where = jest.fn()
  User.withGraphFetched = jest.fn()
  User.throwIfNotFound = jest.fn()
  User.first = jest.fn()

  User.query.mockReturnThis()
  User.where.mockReturnThis()
  User.withGraphFetched.mockReturnThis()
  User.throwIfNotFound.mockReturnThis()
})

test("Authorize returns error message for requests without username header", () => {
  let req = { get: jest.fn() }
  let res = { json: jest.fn(), status: jest.fn() }
  let next = jest.fn()
  req.get.mockReturnValue(undefined)
  res.status.mockReturnThis()
  Authorize(req, res, next)
  expect(res.status).toHaveBeenCalledWith(401)
  expect(res.json).toHaveBeenCalledWith({ messages: ["unauthorized access"] })
})

test("Authorize calls next() for authenticated users with required permissions for route", async () => {
  let req = { get: jest.fn(), route: { path: "/users" }, method: "GET" }
  req.get.mockReturnValue("valid-username")

  let res = { json: jest.fn() }
  let next = jest.fn()
  let validUser = { role: { permissions: ["can-list-users"] } }
  User.first.mockResolvedValue(validUser)
  await Authorize(req, res, next)
  expect(next).toHaveBeenCalledTimes(1)
})

test("Authorize calls next() for authenticated users accessing routes without specified permissions", async () => {
  let req = { get: jest.fn(), route: { path: "/rooms/:id" }, method: "GET" }
  req.get.mockReturnValue("valid-username")

  let res = { json: jest.fn() }
  let next = jest.fn()
  let validUser = { role: { permissions: ["can-list-users"] } }
  User.first.mockResolvedValue(validUser)
  await Authorize(req, res, next)
  expect(next).toHaveBeenCalledTimes(1)
})

test("Authorize returns error message for users without required permissions for route", async () => {
  let req = { get: jest.fn(), route: { path: "/users" }, method: "GET" }
  req.get.mockReturnValue("valid-username")

  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()

  let next = jest.fn()
  let validUser = { role: { permissions: ["some-other-permission"] } }
  User.first.mockResolvedValue(validUser)
  await Authorize(req, res, next)
  expect(res.status).toHaveBeenCalledWith(401)
  expect(res.json).toHaveBeenCalledWith({ messages: ["unauthorized access"] })
})
