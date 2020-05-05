const { NotFoundError, ValidationError } = require("objection")
const _ = require("lodash")
const Role = require("../../data-access/models/Role")
const Permissions = require("../../data-access/models/Permissions")

module.exports = {
  async index(req, res) {
    let roles = await Role.query().where("active", "=", 1)
    return res.json(roles)
  },

  async permissions(req, res) {
    return res.json(Permissions)
  },

  async create(req, res) {
    try {
      let role = await Role.query().insert({
        name: _.get(req, ["body", "name"]),
        permissions: _.get(req, ["body", "permissions"])
      })
      return res.json(role)
    } catch (error) {
      if (error.type === "InvalidRolePermissionError" || error.type === "NewRoleNameValidation") {
        return res.status(400).json({ messages: [error.message] })
      }

      if (error instanceof ValidationError) {
        let errorMessages = []
        let modelErrors = Object.keys(error.data)

        modelErrors.forEach((modelError) => {
          error.data[modelError].forEach((e) => {
            errorMessages.push(`${modelError}: ${e.message} `)
          })
        })

        return res.status(400).json({ messages: errorMessages })
      }

      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async edit(req, res) {
    try {
      let role = await Role.query()
        .patchAndFetchById(_.toNumber(req.params.id), {
          name: _.get(req, ["body", "name"]),
          permissions: _.get(req, ["body", "permissions"])
        })
        .throwIfNotFound()
      return res.json(role)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["the selected role was not found"] })
      }

      if (error.type === "InvalidRolePermissionError") {
        return res.status(400).json({ messages: [error.message] })
      }

      if (error instanceof ValidationError) {
        let errorMessages = []
        let modelErrors = Object.keys(error.data)

        modelErrors.forEach((modelError) => {
          error.data[modelError].forEach((e) => {
            errorMessages.push(`${modelError}: ${e.message} `)
          })
        })

        return res.status(400).json({ messages: errorMessages })
      }
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async show(req, res) {
    try {
      let role = await Role.query()
        .findById(_.toNumber(req.params.id))
        .throwIfNotFound()
      return res.json(role)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not find selected role"] })
      }
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async delete(req, res) {
    try {
      let numDeletedRows = await Role.query()
        .findById(_.toNumber(req.params.id))
        .patch({ active: false })
        .throwIfNotFound()
      return res.json({ message: "successfully deleted selected role" })
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not delete selected role"] })
      }

      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  }
}
