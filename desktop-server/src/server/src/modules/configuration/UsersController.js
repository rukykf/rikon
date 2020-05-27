const { NotFoundError, ValidationError, UniqueViolationError } = require("objection")
const { DateTime } = require("luxon")
const _ = require("lodash")
const User = require("../../data-access/models/User")

module.exports = {
  async index(req, res) {
    let users = await User.query()
      .withGraphFetched("role")
      .where("active", "=", 1)
    return res.json(users)
  },

  async create(req, res) {
    try {
      let newUser = await User.query().insert({
        username: _.get(req, ["body", "username"]),
        first_name: _.get(req, ["body", "first_name"]),
        last_name: _.get(req, ["body", "last_name"]),
        password: _.get(req, ["body", "password"]),
        role_id: _.get(req, ["body", "role_id"])
      })
      return res.json(newUser)
    } catch (error) {
      if (error instanceof UniqueViolationError) {
        return res.status(400).json({ messages: ["This username is already taken, try another one"] })
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
      let updatedUser = await User.query()
        .patchAndFetchById(_.toNumber(req.params.id), {
          username: _.get(req, ["body", "username"]),
          first_name: _.get(req, ["body", "first_name"]),
          last_name: _.get(req, ["body", "last_name"]),
          password: _.get(req, ["body", "password"]),
          role_id: _.get(req, ["body", "role_id"])
        })
        .throwIfNotFound()

      return res.json(updatedUser)
    } catch (error) {
      if (error instanceof UniqueViolationError) {
        return res.status(400).json({ messages: ["This username is already taken, try another one"] })
      }

      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["The selected user was not found"] })
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
      let user = await User.query()
        .findById(_.toNumber(req.params.id))
        .withGraphFetched("role")
        .throwIfNotFound()
      return res.json(user)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not find selected user"] })
      }
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async delete(req, res) {
    try {
      let numDeletedRows = await User.query()
        .findById(_.toNumber(req.params.id))
        .patch({ active: false, deleted_at: DateTime.local().toSeconds() })
        .throwIfNotFound()
      return res.json({ message: "successfully deleted selected user" })
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not delete the selected user"] })
      }
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  }
}
