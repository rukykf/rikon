const roles = [
  {
    id: 1,
    name: "administrator",
    permissions: JSON.stringify({ permissions: ["can-view-reports", "can-create-configuration"] })
  },
  {
    id: 2,
    name: "accountant",
    permissions: JSON.stringify({ permissions: ["can-view-reports", "can-create-configuration"] })
  },
  {
    id: 3,
    name: "receptionist",
    permissions: JSON.stringify({ permissions: ["can-view-reports", "can-create-configuration"] })
  }
]

const users = [
  {
    id: 1,
    username: "accountant",
    first_name: "First",
    last_name: "Last",
    password: "password",
    role_id: 2
  },
  {
    id: 2,
    username: "administrator",
    first_name: "First",
    last_name: "Last",
    password: "password",
    role_id: 1
  },
  {
    id: 3,
    username: "receptionist",
    first_name: "Reception",
    last_name: "Last",
    password: "password",
    role_id: 3
  }
]

module.exports.users = users
module.exports.roles = roles
