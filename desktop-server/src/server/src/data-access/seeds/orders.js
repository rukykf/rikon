const { cancelledOrders, pendingOrders, fulfilledOrders } = require("../seed-factories/departments-sales-items-orders")

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("orders")
    .del()
    .then(function() {
      let orders = cancelledOrders.concat(pendingOrders, fulfilledOrders)
      // Inserts seed entries
      return knex("orders").insert(orders)
    })
}
