const { NotFoundError, ValidationError, UniqueViolationError } = require("objection")
const _ = require("lodash")
const { DateTime } = require("luxon")
const Room = require("../../data-access/models/Room")

module.exports = {
  async index(req, res) {
    let rooms = await Room.query()
      .withGraphFetched("room_type")
      .where("active", "=", 1)
    return res.json(rooms)
  },

  async create(req, res) {
    try {
      let room = await Room.query().insert({
        room_no: _.get(req, ["body", "room_no"]),
        room_type_id: _.get(req, ["body", "room_type_id"])
      })
      return res.json(room)
    } catch (error) {
      if (error instanceof UniqueViolationError) {
        return res.status(400).json({ messages: ["this number is already assigned to another room"] })
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
      let room = await Room.query()
        .patchAndFetchById(_.toNumber(req.params.id), {
          room_no: _.get(req, ["body", "room_no"]),
          room_type_id: _.get(req, ["body", "room_type_id"])
        })
        .throwIfNotFound()
      return res.json(room)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["the selected room was not found"] })
      }

      if (error instanceof UniqueViolationError) {
        return res.status(400).json({ messages: ["this number is already assigned to another room"] })
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
      let room = await Room.query()
        .findById(_.toNumber(req.params.id))
        .withGraphFetched("room_type")
        .throwIfNotFound()
      return res.json(room)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not find selected room"] })
      }
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async delete(req, res) {
    try {
      let numDeletedRows = await Room.query()
        .findById(_.toNumber(req.params.id))
        .patch({
          active: false,
          deleted_at: DateTime.local().toSeconds()
        })
        .throwIfNotFound()
      return res.json({ message: "successfully deleted selected room type" })
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not delete selected room"] })
      }
      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  }
}
