const UsersController = require("../../../../src/modules/configuration/UsersController")
const db = require(".../../../../src/data-access/db-config")
let User = require("../../../../src/data-access/models/User")
let Role = require("../../../../src/data-access/models/Role")
const Permissions = require("../../../../src/data-access/models/Permissions")

let newRole = null

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
  newRole = await Role.query().insert({ name: "dummy", permissions: [Permissions[0]] })
})

afterAll(async () => {
  Role.query().delete()
  await User.query().delete()
})

beforeEach(async () => {
  await User.query().delete()
})

test("UsersController.index returns list of available users", async () => {
  let newUser = {
    username: "myuser",
    first_name: "firstname",
    last_name: "lastname",
    password: "password",
    role_id: newRole.id
  }
  let user = await User.query().insert(newUser)
  let req = {}
  let res = { json: jest.fn() }

  await UsersController.index(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining(newUser)]))
})

test("UsersController.create returns a newly created user when passed valid user data", async () => {
  let newUser = {
    username: "myuser",
    first_name: "firstname",
    last_name: "lastname",
    password: "password",
    role_id: newRole.id
  }
  let req = { body: newUser }
  let res = { json: jest.fn() }
  await UsersController.create(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining(newUser))
})

test("UsersController.create returns error message when passed an existing username", async () => {
  let newUser = {
    username: "myuser",
    first_name: "firstname",
    last_name: "lastname",
    password: "password",
    role_id: newRole.id
  }
  let user = await User.query().insert(newUser)
  let req = { body: newUser }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()

  await UsersController.create(req, res)

  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({ messages: ["This username is already taken, try another one"] })
  )
  expect(res.status).toHaveBeenCalledWith(400)
})

test("UsersController.create returns error message when passed invalid json schema", async () => {
  let newUser = {
    username: "myuser",
    password: "password",
    role_id: newRole.id
  }
  let req = { body: newUser }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()

  await UsersController.create(req, res)

  expect(res.json).toHaveBeenCalledWith({ messages: expect.anything() })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("UsersController.edit returns updated user when passed valid user data", async () => {
  let user = await User.query().insert({
    username: "myuser",
    first_name: "first name",
    last_name: "last name",
    password: "password",
    role_id: 3
  })
  let req = { params: { id: user.id }, body: { username: "updated_myuser" } }
  let res = { json: jest.fn() }
  await UsersController.edit(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ username: "updated_myuser" }))
})

test("UsersController.edit returns error message when passed invalid user id", async () => {
  let req = { params: { id: 1 }, body: { username: "updated_myuser" } }
  let res = { status: jest.fn(), json: jest.fn() }
  res.status.mockReturnThis()
  await UsersController.edit(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ messages: ["The selected user was not found"] }))
  expect(res.status).toHaveBeenCalledWith(400)
})

test("UsersController.edit returns error message when passed model invalid model", async () => {
  let user = await User.query().insert({
    username: "myuser",
    first_name: "first name",
    last_name: "last name",
    password: "password",
    role_id: 3
  })
  let req = { params: { id: user.id }, body: { username: null } }
  let res = { status: jest.fn(), json: jest.fn() }
  res.status.mockReturnThis()
  await UsersController.edit(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ messages: expect.anything() }))
  expect(res.status).toHaveBeenCalledWith(400)
})

test("UsersController.show returns selected user when passed valid user id", async () => {
  let user = await User.query().insert({
    username: "myuser",
    first_name: "first name",
    last_name: "last name",
    password: "password",
    role_id: newRole.id
  })
  let req = { params: { id: user.id } }
  let res = { json: jest.fn() }
  await UsersController.show(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining(user))
})

test("UsersController.show returns error message when passed invalid user id", async () => {
  let req = { params: { id: 3 } }
  let res = { status: jest.fn(), json: jest.fn() }
  res.status.mockReturnThis()

  await UsersController.show(req, res)

  expect(res.json).toHaveBeenCalledWith({ messages: ["could not find selected user"] })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("UsersController.delete returns success message when passed valid user id", async () => {
  let user = await User.query().insert({
    username: "myuser",
    first_name: "first name",
    last_name: "last name",
    password: "password",
    role_id: 3
  })
  let req = { params: { id: user.id }, body: { username: null } }
  let res = { json: jest.fn() }
  await UsersController.delete(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: ["successfully deleted selected user"] })
})

test("UsersController.delete returns error message when passed invalid user id", async () => {
  let req = { params: { id: 3 }, body: { username: null } }
  let res = { status: jest.fn(), json: jest.fn() }
  res.status.mockReturnThis()
  await UsersController.delete(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: ["could not delete the selected user"] })
})
