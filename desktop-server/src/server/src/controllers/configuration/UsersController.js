const { NotFoundError } = require("objection")
const User = require("../../data-access/models/User")

module.exports = {
  async index(req, res) {
    let users = await User.query().withGraphFetched("role")
    return res.json(users)
  },

  async create(req, res) {
    try {
      let newUser = await User.query().insert({
        username: req.body.username,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        password: req.body.password,
        role_id: req.body.role_id
      })
      return res.json(newUser)
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
      let updatedUser = await User.query()
        .patchAndFetchById(req.params.id, {
          username: req.body.username,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          password: req.body.password,
          role_id: req.body.role_id
        })
        .throwIfNotFound()

      return res.json(updatedUser)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["The selected user was not found"] })
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
      let user = await User.query()
        .findById(req.params.id)
        .withGraphFetched("role")
        .throwIfNotFound()
      return res.json(user)
    } catch (error) {
      return res.status(400).json({ messages: ["could not find selected user"] })
    }
  },

  async delete(req, res) {
    try {
      let numDeletedRows = await User.query()
        .deleteById(req.params.id)
        .throwIfNotFound()
      return res.json({ message: "successfully deleted selected user" })
    } catch (error) {
      return res.status(400).json({ messages: ["could not delete the selected user"] })
    }
  }
}
