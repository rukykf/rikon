const fs = require('fs')
const faker = require('faker')
let output = {
    users: [],
    roles: [],
    salesItems: [],
    departments: [],
    rooms: [],
    roomTypes: []
}

class User {
    constructor(id, firstName, lastName, role, departments, username, password){
        this.id = id
        this.firstName = firstName
        this.lastName = lastName
        this.role = role
        this.departments = departments
        this.username = username
        this.password = password
    }
}

class Role {
    constructor(id, name, permissions){
        this.id = id
        this.name = name
        this.permissions = permissions
    }
}

class SalesItem{
    constructor(id, name, unit, pricePerUnit, department){
        this.id = id
        this.name = name
        this.unit = unit
        this.pricePerUnit = pricePerUnit
        this.department = department
    }
}

class Room {
    constructor(id, number, type, isAvailable){
        this.id = id
        this.number = number
        this.type = type
        this.isAvailable = isAvailable
    }
}

class RoomType{
    constructor(id, name, pricePerNight){
        this.id = id
        this.name = name
        this.pricePerNight = pricePerNight
    }
}

class Department{
    constructor(id, name){
        this.id = id
        this.name = name
    }
}

let usersCount = 1
function generateUsers(num){
    for(let i = 0; i < num; i++){
        let user = new User(usersCount, faker.name.firstName(), faker.name.lastName(), faker.random.arrayElement(['administrator', 'receptionist', 'MD', 'accountant']),
                            faker.random.arrayElement(['all departments', 'hotel', 'kitchen', 'bar']), faker.name.firstName(), faker.internet.password())
        usersCount += 1
        output.users.push(user)
    }
}

let rolesCount = 1
function generateRoles(num){
    for(let i = 0; i < num; i++){
        let role = new Role(rolesCount, faker.random.arrayElement(['Administrator', 'MD', 'Receptionist', 'Sales Person']), ['pos', 'can-view-forms'])
        output.roles.push(role)
        rolesCount += 1
    }
}

let salesItemsCount = 1
function generateSalesItems(num){
    for(let i = 0; i < num; i++){
        let salesItem = new SalesItem(salesItemsCount, faker.commerce.productName(), faker.random.arrayElement(['Gallons', 'Plates', 'Tubes']),
                                        faker.random.arrayElement([3000, 1500, 500, 1000, 5000]), faker.random.arrayElement(['kitchen', 'bar', 'reception']))
        output.salesItems.push(salesItem)
        salesItemsCount += 1
    }
}

let roomsCount = 1
function generateRooms(num){
    for(let i = 0; i < num; i++){
        let room = new Room(roomsCount, faker.random.arrayElement([103, 105, 101, 109]), 7, faker.random.boolean)
        output.rooms.push(room)
        roomsCount += 1
    }
}

let roomTypesCount = 1
function generateRoomType(num){
    for(let i = 0; i < num; i++){
        let roomType = new RoomType(roomTypesCount, faker.random.arrayElement(['Deluxe', 'Classic', 'VIP']),
                                    faker.random.arrayElement([3000, 5000, 7000, 20000, 10000]))
        output.roomTypes.push(roomType)
        roomTypesCount += 1
    }
}

let departmentsCount = 1
function generateDepartments(num){
    for(let i = 0; i < num; i++){
        let department = new Department(departmentsCount, faker.random.arrayElement(['Kitchen', 'Bar', 'Garden']))
        output.departments.push(department)
        departmentsCount += 1
    }
}

generateUsers(50)
generateRoles(10)
generateSalesItems(60)
generateRooms(70)
generateRoomType(6)
generateDepartments(5)

let outputString = JSON.stringify(output, null, 1)
fs.writeFile("configuration.json", outputString, function(err){
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
 
    console.log("JSON file has been saved."); 
})