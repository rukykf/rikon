let configurationPermissions = {
  "/users": { GET: "can-list-users", POST: "can-create-users" },
  "/users/:id": { GET: "can-view-user", POST: "can-edit-users" }
}

let salesPermissions = {
  "/rooms": { GET: "can-list-rooms", POST: "can-create-rooms" },
  "/rooms/:id": { GET: "can-list-room", POST: "can-edit-room" }
}

let routePermissions = {
  ...configurationPermissions,
  ...salesPermissions
}

module.exports = routePermissions
