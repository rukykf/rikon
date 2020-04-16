const { NotFoundError } = require("objection")
const Role = require("../../data-access/models/Role")
const Permissions = require("../../data-access/models/Permissions")

module.exports = {
  async index(req, res) {
    let roles = await Role.query()
    return res.json(roles)
  },

  async permissions(req, res) {
    return res.json(Permissions)
  },

  async create(req, res) {
    try {
      let role = await Role.query().insert({
        name: req.body.name,
        permissions: req.body.permissions
      })
      return res.json(role)
    } catch (error) {
      if (error.type === "ModelValidation") {
        let errorMessages = []
        let modelErrors = Object.keys(error.data)

        modelErrors.forEach((modelError) => {
          error.data[modelError].forEach((e) => {
            errorMessages.push(`${modelError}: ${e.message} `)
          })
        })

        return res.status(400).json({ messages: errorMessages })
      }
      return res.status(400).json({ messages: [error.message] })
    }
  },

  async edit(req, res) {
    try {
      let role = await Role.query()
        .patchAndFetchById(req.params.id, {
          name: req.body.name,
          permissions: req.body.permissions
        })
        .throwIfNotFound()
      return res.json(role)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["the selected role was not found"] })
      }

      if (error.type === "ModelValidation") {
        let errorMessages = []
        let modelErrors = Object.keys(error.data)

        modelErrors.forEach((modelError) => {
          error.data[modelError].forEach((e) => {
            errorMessages.push(`${modelError}: ${e.message} `)
          })
        })

        return res.status(400).json({ messages: errorMessages })
      }
      return res.status(400).json({ messages: [error.message] })
    }
  },

  async show(req, res) {
    try {
      let role = await Role.query()
        .findById(req.params.id)
        .throwIfNotFound()
      return res.json(role)
    } catch (error) {
      return res.status(400).json({ messages: ["could not find selected role"] })
    }
  },

  async delete(req, res) {
    try {
      let numDeletedRows = await Role.query()
        .deleteById(req.params.id)
        .throwIfNotFound()
      return res.json({ message: "successfully deleted selected role" })
    } catch (error) {
      return res.status(400).json({ messages: ["could not delete selected role"] })
    }
  }
}
