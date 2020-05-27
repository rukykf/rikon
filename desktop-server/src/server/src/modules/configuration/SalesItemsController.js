const { NotFoundError, ValidationError, UniqueViolationError } = require("objection")
const { DateTime } = require("luxon")
const _ = require("lodash")
const SalesItem = require("../../data-access/models/SalesItem")

module.exports = {
  async index(req, res) {
    let salesItems = await SalesItem.query()
      .withGraphFetched("department")
      .where("active", "=", 1)
    return res.json(salesItems)
  },

  async create(req, res) {
    try {
      let salesItem = await SalesItem.query().insert({
        name: _.get(req, ["body", "name"]),
        unit: _.get(req, ["body", "unit"]),
        price_per_unit: _.get(req, ["body", "price_per_unit"]),
        department_id: _.get(req, ["body", "department_id"])
      })
      return res.json(salesItem)
    } catch (error) {
      if (error instanceof UniqueViolationError) {
        return res.status(400).json({ messages: ["a sales item with this name already exists"] })
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
      let salesItem = await SalesItem.query()
        .patchAndFetchById(_.toNumber(req.params.id), {
          name: _.get(req, ["body", "name"]),
          unit: _.get(req, ["body", "unit"]),
          price_per_unit: _.get(req, ["body", "price_per_unit"]),
          department_id: _.get(req, ["body", "department_id"])
        })
        .throwIfNotFound()
      return res.json(salesItem)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["the selected sales item was not found"] })
      }

      if (error instanceof UniqueViolationError) {
        return res.status(400).json({ messages: ["a sales item with this name already exists"] })
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
      let salesItem = await SalesItem.query()
        .findById(_.toNumber(req.params.id))
        .withGraphFetched("department")
        .throwIfNotFound()
      return res.json(salesItem)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["the selected sales item was not found"] })
      }
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async delete(req, res) {
    try {
      let numDeletedRows = await SalesItem.query()
        .findById(_.toNumber(req.params.id))
        .patch({ active: false, deleted_at: DateTime.local().toSeconds() })
        .throwIfNotFound()
      return res.json({ message: "successfully deleted the selected sales item" })
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not delete selected sales item"] })
      }
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  }
}
