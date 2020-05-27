const { NotFoundError, ValidationError, UniqueViolationError } = require("objection")
const { DateTime } = require("luxon")
const _ = require("lodash")
const Department = require("../../data-access/models/Department")

module.exports = {
  async index(req, res) {
    let departments = await Department.query().where("active", "=", 1)
    return res.json(departments)
  },

  async create(req, res) {
    try {
      let department = await Department.query().insert({
        name: _.get(req, ["body", "name"])
      })
      return res.json(department)
    } catch (error) {
      if (error instanceof UniqueViolationError) {
        return res.status(400).json({ messages: ["this name is already assigned to another department"] })
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
      let department = await Department.query()
        .patchAndFetchById(_.toNumber(req.params.id), {
          name: _.get(req, ["body", "name"])
        })
        .throwIfNotFound()
      return res.json(department)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["the selected department was not found"] })
      }

      if (error instanceof UniqueViolationError) {
        return res.status(400).json({ messages: ["this name is already assigned to another department"] })
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
      let department = await Department.query()
        .findById(_.toNumber(req.params.id))
        .throwIfNotFound()
      return res.json(department)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not find selected department"] })
      }
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async delete(req, res) {
    try {
      let numDeletedRows = await Department.query()
        .findById(req.params.id)
        .throwIfNotFound()
        .patch({ active: false, deleted_at: DateTime.local().toSeconds() })
      return res.json({ message: "successfully deleted selected department" })
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not delete selected department"] })
      }
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  }
}
