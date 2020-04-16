const { NotFoundError } = require("objection")
const SalesItem = require("../../data-access/models/SalesItem")

module.exports = {
  async index(req, res) {
    let salesItems = await SalesItem.query().withGraphFetched("department")
    return res.json(salesItems)
  },

  async create(req, res) {
    try {
      let salesItem = await SalesItem.query().insert({
        name: req.body.name,
        unit: req.body.unit,
        price_per_unit: req.body.price_per_unit,
        department_id: req.body.department_id
      })
      return res.json(salesItem)
    } catch (error) {
      if (error.type === "NewSalesItemNameValidation") {
        return res.status(400).json({ messages: [error.message] })
      }

      let errorMessages = []
      let modelErrors = Object.keys(error.data)

      modelErrors.forEach((modelError) => {
        error.data[modelError].forEach((e) => {
          errorMessages.push(`${modelError}: ${e.message} `)
        })
      })
      return res.status(400).json({ messages: errorMessages })
    }
  },

  async edit(req, res) {
    try {
      let salesItem = await SalesItem.query()
        .patchAndFetchById(req.params.id, {
          name: req.body.name,
          unit: req.body.unit,
          price_per_unit: req.body.price_per_unit,
          department_id: req.body.department_id
        })
        .throwIfNotFound()
      return res.json(salesItem)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["the selected sales item was not found"] })
      }

      if (error.type === "NewSalesItemNameValidation") {
        return res.status(400).json({ messages: [error.message] })
      }

      let errorMessages = []
      let modelErrors = Object.keys(error.data)

      modelErrors.forEach((modelError) => {
        error.data[modelError].forEach((e) => {
          errorMessages.push(`${modelError}: ${e.message} `)
        })
      })

      return res.status(400).json({ messages: errorMessages })
    }
  },

  async show(req, res) {
    try {
      let salesItem = await SalesItem.query()
        .findById(req.params.id)
        .throwIfNotFound()
      return res.json(salesItem)
    } catch (error) {
      return res.status(400).json({ messages: ["the selected sales item was not found"] })
    }
  },

  async delete(req, res) {
    try {
      let numDeletedRows = await SalesItem.query()
        .deleteById(req.params.id)
        .throwIfNotFound()
      return res.json({ message: "successfully deleted the selected sales item" })
    } catch (error) {
      return res.status(400).json({ messages: ["could not delete selected sales item"] })
    }
  }
}
