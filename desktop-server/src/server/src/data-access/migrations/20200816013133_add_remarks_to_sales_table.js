exports.up = function(knex) {
  knex.schema
    .table("sales", (table) => {
      table.string("remarks").defaultTo("")
    })
    .then(() => {
      console.log("added remarks to sales table")
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
    })
}

exports.down = function(knex) {
  knex.schema
    .table("sales", (table) => {
      table.dropColumn("remarks")
    })
    .then(() => {
      console.log("dropped modifications to sales table")
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
    })
}
