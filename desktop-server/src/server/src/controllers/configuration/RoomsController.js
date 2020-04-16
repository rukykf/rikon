const { NotFoundError } = require("objection")
const Room = require("../../data-access/models/Room")

module.exports = {
  async index(req, res) {
    let rooms = await Room.query().withGraphFetched("roomType")
    return res.json(rooms)
  },

  async create(req, res) {
    try {
      let room = await Room.query().insert({
        room_no: req.body.room_no,
        room_type_id: req.body.room_type_id
      })
      return res.json(room)
    } catch (error) {
      if (error.type === "NewRoomNumberValidation") {
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
      let room = await Room.query()
        .patchAndFetchById(req.params.id, {
          room_no: req.body.room_no,
          room_type_id: req.body.room_type_id
        })
        .throwIfNotFound()
      return res.json(room)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["the selected room was not found"] })
      }

      if (error.type === "NewRoomNumberValidation") {
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
      let room = await Room.query()
        .findById(req.params.id)
        .throwIfNotFound()
      return res.json(room)
    } catch (error) {
      return res.status(400).json({ messages: ["could not find selected room"] })
    }
  },

  async delete(req, res) {
    try {
      let numDeletedRows = await Room.query()
        .deleteById(req.params.id)
        .throwIfNotFound()
      return res.json({ message: "successfully deleted selected room type" })
    } catch (error) {
      return res.status(400).json({ messages: ["could not delete selected room"] })
    }
  }
}
