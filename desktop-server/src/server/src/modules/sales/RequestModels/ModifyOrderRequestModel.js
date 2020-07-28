const CreateOrderRequestModel = require("./CreateOrderRequestModel")

class ModifyOrderRequestModel {
  constructor(req) {
    this.oldOrderId = req.params.id
    this.newOrderRequest = new CreateOrderRequestModel(req)
  }
}

module.exports = ModifyOrderRequestModel
