const UsersController = require("../../../src/controllers/UsersController")
let users = require("../../../src/data-access/models/User")

// jest.mock("../../../src/data-access/models/User", () => {
//   const original = require.requireActual("../../../src/data-access/models/User")
//   return {
//     ...original,
//     User: {
//       fetchAll: jest.fn()
//     }
//   }
// })

test("returns list of available users", async () => {
  // let usersData = users.Users.forge([{ user: 1 }, { user: 2 }])
  // users.User.fetchAll.mockResolvedValue(usersData)
  let result = await UsersController.index()
  expect(result.length).toBe(2)
})
