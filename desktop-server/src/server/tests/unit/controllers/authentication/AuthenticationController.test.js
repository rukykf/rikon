const AuthenticationController = require("../../../../src/controllers/authentication/AuthenticationController")
const User = require("../../../../src/data-access/models/User")
const Role = require("../../../../src/data-access/models/Role")
const Permissions = require("../../../../src/data-access/models/Permissions")

test("AuthenticationController.login returns authenticated user when passed valid credentials", async () => {
  let newRole = await Role.query().insert({ name: "dummy", permissions: [Permissions[0]] })
  let user = await User.query().insert({
    username: "myuser",
    first_name: "firstname",
    last_name: "lastname",
    password: "password",
    role_id: newRole.id
  })
  let req = {
    body: {
      username: "myuser",
      password: "password"
    }
  }
  let res = { json: jest.fn() }
  await AuthenticationController.login(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining(user))
  User.query().delete()
  Role.query().delete()
})

test("AuthenticationController.login returns error message when passed invalid credentials", async () => {
  await User.query().delete()
  let req = {
    body: {
      username: "myuser",
      password: "password"
    }
  }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await AuthenticationController.login(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: ["invalid login credentials"] })
  expect(res.status).toHaveBeenCalledWith(400)
})
