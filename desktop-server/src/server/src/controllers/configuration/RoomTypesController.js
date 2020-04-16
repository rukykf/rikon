const { NotFoundError } = require("objection")
const RoomType = require("../../data-access/models/RoomType")

module.exports = {
  async index(req, res) {
    let roomTypes = await RoomType.query()
    return res.json(roomTypes)
  },

  async create(req, res) {
    try {
      let roomType = await RoomType.query().insert({
        name: req.body.name,
        price_per_night: req.body.price_per_night
      })
      return res.json(roomType)
    } catch (error) {
      if (error.type === "NewRoomTypeNameValidation") {
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
      let roomType = await RoomType.query()
        .patchAndFetchById(req.params.id, {
          name: req.body.name,
          price_per_night: req.body.price_per_night
        })
        .throwIfNotFound()

      return res.json(roomType)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["the selected room type was not found"] })
      }

      if (error.type === "NewRoomTypeNameValidation") {
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
      let roomType = await RoomType.query()
        .findById(req.params.id)
        .throwIfNotFound()
      return res.json(roomType)
    } catch (error) {
      return res.status(400).json({ messages: ["could not find selected room type"] })
    }
  },

  async delete(req, res) {
    try {
      let numDeletedRows = await RoomType.query()
        .deleteById(req.params.id)
        .throwIfNotFound()
      return res.json({ message: "successfully deleted selected room type" })
    } catch (error) {
      return res.status(400).json({ messages: ["could not delete selected room type"] })
    }
  }
}
