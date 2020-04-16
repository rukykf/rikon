const { NotFoundError } = require("objection")
const Department = require("../../data-access/models/Department")

module.exports = {
  async index(req, res) {
    let departments = await Department.query()
    return res.json(departments)
  },

  async create(req, res) {
    try {
      let department = await Department.query().insert({
        name: req.body.name
      })
      return res.json(department)
    } catch (error) {
      if (error.type === "NewDepartmentNameValidation") {
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
      let department = await Department.query()
        .patchAndFetchById(req.params.id, {
          name: req.body.name
        })
        .throwIfNotFound()
      return res.json(department)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["the selected department was not found"] })
      }

      if (error.type === "NewDepartmentNameValidation") {
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
      let department = await Department.query()
        .findById(req.params.id)
        .throwIfNotFound()
      return res.json(department)
    } catch (error) {
      return res.status(400).json({ messages: ["could not find selected department"] })
    }
  },

  async delete(req, res) {
    try {
      let numDeletedRows = await Department.query()
        .deleteById(req.params.id)
        .throwIfNotFound()
      return res.json({ message: "successfully deleted selected department" })
    } catch (error) {
      return res.status(400).json({ messages: ["could not delete selected department"] })
    }
  }
}
