const { NotFoundError, ValidationError } = require("objection")
const _ = require("lodash")
const RoomType = require("../../data-access/models/RoomType")

module.exports = {
  async index(req, res) {
    let roomTypes = await RoomType.query().where("active", "=", 1)
    return res.json(roomTypes)
  },

  async create(req, res) {
    try {
      let roomType = await RoomType.query().insert({
        name: _.get(req, ["body", "name"]),
        price_per_night: _.get(req, ["body", "price_per_night"])
      })
      return res.json(roomType)
    } catch (error) {
      if (error.type === "NewRoomTypeNameValidation") {
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
      let roomType = await RoomType.query()
        .patchAndFetchById(_.toNumber(req.params.id), {
          name: _.get(req, ["body", "name"]),
          price_per_night: _.get(req, ["body", "price_per_night"])
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
      let roomType = await RoomType.query()
        .findById(_.toNumber(req.params.id))
        .throwIfNotFound()
      return res.json(roomType)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not find selected room type"] })
      }
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async delete(req, res) {
    try {
      let numDeletedRows = await RoomType.query()
        .findById(_.toNumber(req.params.id))
        .patch({ active: false })
        .throwIfNotFound()
      return res.json({ message: "successfully deleted selected room type" })
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not delete selected room type"] })
      }
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  }
}
