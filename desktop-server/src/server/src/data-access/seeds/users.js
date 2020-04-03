exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("users")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("users").insert([
        { username: "demouser", first_name: "Demo First", last_name: "Demo Last", password: "Demo Pass" }
      ])
    })
}
