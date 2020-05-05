const Authenticate = require("../../../src/middleware/Authenticate")

test("Authenticate returns error message for requests without authentication header", () => {
  let req = { get: jest.fn() }
  let res = { json: jest.fn(), status: jest.fn() }
  let next = jest.fn()
  req.get.mockReturnValue(undefined)
  res.status.mockReturnThis()
  Authenticate(req, res, next)
  expect(res.status).toHaveBeenCalledWith(401)
  expect(res.json).toHaveBeenCalledWith({ messages: ["unauthorized access"] })
})

test("Authenticate calls next() for requests with authentication header", () => {
  let req = { get: jest.fn() }
  let res = { json: jest.fn() }
  let next = jest.fn()
  req.get.mockReturnValue("some-authenticated-user")
  Authenticate(req, res, next)
  expect(next).toHaveBeenCalledTimes(1)
})
