const db = require(".../../../../src/data-access/db-config")
const Role = require("../../../../src/data-access/models/Role")
const RolesController = require("../../../../src/controllers/configuration/RolesController")
const Permissions = require("../../../../src/data-access/models/Permissions")

beforeAll(async () => {
  await db.migrate.latest({ directory: "./src/server/src/data-access/migrations" })
})

beforeEach(async () => {
  await Role.query().delete()
})

afterEach(async () => {
  await Role.query().delete()
})

test("RolesController.index returns list of available roles", async () => {
  let role = await Role.query().insert({
    name: "some-new-role",
    permissions: [Permissions[0]]
  })
  let res = { json: jest.fn() }
  let req = {}
  await RolesController.index(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([role]))
})

test("RolesController.create returns newly created role when passed valid data", async () => {
  let req = {
    body: {
      name: "new role",
      permissions: [Permissions[0]]
    }
  }

  let res = { json: jest.fn() }
  await RolesController.create(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining(req.body))
})

test("RolesController.create returns error message when passed invalid permission", async () => {
  let req = {
    body: {
      name: "new role",
      permissions: ["bird-permission"]
    }
  }

  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await RolesController.create(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: ["bird-permission is not a valid role permission"] })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("RolesController.create returns error message when passed existing role name", async () => {
  let role = await Role.query().insert({
    name: "some-role",
    permissions: [Permissions[0]]
  })
  let req = {
    body: {
      name: "some-role",
      permissions: [Permissions[0]]
    }
  }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await RolesController.create(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: ["this name is already assigned to another role"] })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("RolesController.create returns error message when passed invalid json schema", async () => {
  let req = {
    body: {
      permissions: [Permissions[0]]
    }
  }

  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await RolesController.create(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.anything())
  expect(res.status).toHaveBeenCalledWith(400)
})

test("RolesController.edit returns updated role when passed valid data", async () => {
  let role = await Role.query().insert({ name: "new role", permissions: [Permissions[0]] })
  let req = {
    params: { id: role.id },
    body: {
      name: "updated role"
    }
  }

  let res = { json: jest.fn() }
  await RolesController.edit(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining(req.body))
})

test("RolesController.edit returns error message when passed invalid role id", async () => {
  let req = {
    params: { id: 12 },
    body: {
      name: "updated role"
    }
  }

  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await RolesController.edit(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: ["the selected role was not found"] })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("RolesController.edit returns error message when passed invalid json schema", async () => {
  let role = await Role.query().insert({ name: "new role", permissions: [Permissions[0]] })
  let req = {
    params: { id: role.id },
    body: {
      name: null
    }
  }

  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await RolesController.edit(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.anything())
  expect(res.status).toHaveBeenCalledWith(400)
})

test("RolesController.show returns selected role when passed valid id", async () => {
  let role = await Role.query().insert({ name: "new role", permissions: [Permissions[0]] })
  let req = { params: { id: role.id } }
  let res = { json: jest.fn() }
  await RolesController.show(req, res)
  expect(res.json).toHaveBeenCalledWith(role)
})

test("RolesController.show returns error message when passed invalid id", async () => {
  let req = { params: { id: 40 } }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await RolesController.show(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: ["could not find selected role"] })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("RolesController.delete returns success message when passed valid id", async () => {
  let role = await Role.query().insert({ name: "new role", permissions: [Permissions[0]] })
  let req = { params: { id: role.id } }
  let res = { json: jest.fn() }
  await RolesController.delete(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "successfully deleted selected role" })
})

test("RolesController.delete returns error message when passed invalid id", async () => {
  let req = { params: { id: 58 } }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await RolesController.delete(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: ["could not delete selected role"] })
  expect(res.status).toHaveBeenCalledWith(400)
})
