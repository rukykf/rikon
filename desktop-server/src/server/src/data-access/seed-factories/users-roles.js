const roles = [
  {
    id: 1,
    name: "administrator",
    permissions: JSON.stringify([
      "can-view-reports",
      "can-view-dashboard",
      "can-view-configurations",
      "can-view-create-user-configuration",
      "can-view-create-sales-item-configuration",
      "can-view-all-configurations",
      "can-view-hotel-reception-dashboard",
      "can-view-point-of-sales-page"
    ])
  },
  {
    id: 2,
    name: "accountant",
    permissions: JSON.stringify([
      "can-view-reports",
      "can-view-dashboard",
      "can-view-hotel-reception-dashboard",
      "can-view-point-of-sales-page"
    ])
  },
  {
    id: 3,
    name: "receptionist",
    permissions: JSON.stringify(["can-view-hotel-reception-dashboard", "can-view-point-of-sales-page"])
  },
  {
    id: 4,
    name: "sales-person",
    permissions: JSON.stringify(["can-view-point-of-sales-page"])
  },
  {
    id: 5,
    name: "supervisor",
    permissions: JSON.stringify([
      "can-view-create-sales-item-configuration",
      "can-view-configurations",
      "can-view-point-of-sales-page"
    ])
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
  },
  {
    id: 4,
    username: "sales-person",
    first_name: "Sales",
    last_name: "Person",
    password: "password",
    role_id: 4
  },
  {
    id: 5,
    username: "supervisor",
    first_name: "Supervisor",
    last_name: "Person",
    password: "password",
    role_id: 5
  }
]

module.exports.users = users
module.exports.roles = roles
