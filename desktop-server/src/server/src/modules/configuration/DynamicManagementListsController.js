const { NotFoundError, ValidationError, UniqueViolationError } = require("objection")
const _ = require("lodash")
const { DateTime } = require("luxon")
const ManagementList = require("../../data-access/models/ManagementList")
const ManagementListIndexRequestModel = require("./RequestModels/ManagementListIndexRequestModel")
const SaveManagementListItemRequestModel = require("./RequestModels/SaveManagementListItemRequestModel")
const getValidationErrorMessages = require("../../utils/GetValidationErrorMessages")

module.exports = {
  async index(req, res) {
    try {
      let requestModel = new ManagementListIndexRequestModel(req)
      let managementListQueryBuilder = ManagementList.query()

      if (requestModel.list_name !== null) {
        managementListQueryBuilder.where("list_name", "=", requestModel.list_name)
      }

      let managementList = await managementListQueryBuilder.execute()
      return res.json(managementList)
    } catch (error) {
      return res.status(500).json({ messages: ["could not retrieve list at this time, try again later"] })
    }
  },

  async create(req, res) {
    try {
      let createManagementListItemRequestModel = new SaveManagementListItemRequestModel(req)

      let managementListItem = await ManagementList.query().insert(createManagementListItemRequestModel)

      return res.json(managementListItem)
    } catch (error) {
      if (error instanceof ValidationError) {
        let errorMessages = getValidationErrorMessages(error)
        return res.status(400).json({ messages: errorMessages })
      }

      if (error instanceof UniqueViolationError) {
        return res.status(400).json({ messages: ["you cannot add this person to the same list twice"] })
      }

      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async edit(req, res) {
    try {
      let updateManagementListItemRequestModel = new SaveManagementListItemRequestModel(req)

      let managementListItem = await ManagementList.query()
        .patchAndFetchById(_.toNumber(req.params.id), updateManagementListItemRequestModel)
        .throwIfNotFound()

      return res.json(managementListItem)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["the selected item was not found"] })
      }

      if (error instanceof ValidationError) {
        let errorMessages = getValidationErrorMessages(error)
        return res.status(400).json({ messages: errorMessages })
      }

      if (error instanceof UniqueViolationError) {
        return res.status(400).json({ messages: ["you cannot add this person to the same list twice"] })
      }

      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async delete(req, res) {
    try {
      let numDeletedRows = await ManagementList.query()
        .findById(_.toNumber(req.params.id))
        .throwIfNotFound()
        .patch({ active: false, deleted_at: DateTime.local().toSeconds() })

      return res.json({ messages: ["successfully deleted selected item"] })
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["the selected item was not found"] })
      }

      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  },

  async show(req, res) {
    try {
      let managementListItem = await ManagementList.query()
        .findById(_.toNumber(req.params.id))
        .throwIfNotFound()
      return res.json(managementListItem)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ messages: ["could not find the selected item"] })
      }

      return res.status(500).json({ messages: ["something went wrong, try again later"] })
    }
  }
}
