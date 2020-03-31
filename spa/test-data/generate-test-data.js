const fs = require('fs')
const faker = require('faker')
const  { DateTime, Interval } = require('luxon')

let output = {
    sales: [],
    creditSales: [],
    pendingCreditSales: [],
    cashSales: [],
    orders: [],
    bookings: [],
    rooms: [],
    booking: generateBooking(5000),
    reservations: generateReservations(3, 100),
    reservation: generateCurrentReservation(100),
    items: generateItems(30).concat(generateItems(30, 'Fried Rice')).concat(generateItems(4, 'Beans')),
    pendingOrders: generateOrders(5),
}

let bookingDetails = "Booked Deluxe Room 107 from Friday, 2nd February 2020 to Tuesday, 5th February, 2020 at N1000 per night"
let salesItemDetails = "Purchased 2 bottles of coke and 3 bottles of heineken from bar on 3rd February, 2020"
let salesItemDetails2 = "Purchased 3 plates of rice from kitchen. Purchased 1 pack of Chi-Exotic on 5th February, 2020"

class Sale {
    constructor(id, details, totalDue, totalPaid, balanceDue, forgivenDebt, customerInfo, status, dateCreated) {
        this.id = id
        this.details = details
        this.totalDue = totalDue
        this.totalPaid = totalPaid
        this.balanceDue = balanceDue
        this.forgivenDebt = forgivenDebt
        this.customerInfo = customerInfo
        this.status = status
        this.dateCreated = dateCreated
    }

}

class Order {
    constructor(id, details, department, totalDue, date, status, notes) {
        this.id = id
        this.details = details
        this.totalDue = totalDue
        this.status = status
        this.notes = notes
        this.date = date
        this.department = department
    }
}

class Booking {
    constructor(id, roomDetails, startDate, endDate, pricePerNight, totalDue, status) {
        this.id = id
        this.roomDetails = roomDetails
        this.startDate = startDate
        this.endDate = endDate
        this.pricePerNight = pricePerNight
        this.totalDue = totalDue
        this.status = status
    }
}

let ordersCount = 1

function generateOrderHistory(num) {
    for (let i = 0; i < num; i++) {
        let order = new Order(ordersCount, salesItemDetails, faker.random.arrayElement(['Kitchen', 'Bar']),
            faker.random.arrayElement([3000, 5000, 20000]), 'March 3rd, 2020', 'Pending', null)
        ordersCount += 1
        output.orders.push(order)
    }
    for (let i = 0; i < num; i++) {
        let order = new Order(ordersCount, salesItemDetails2, faker.random.arrayElement(['Kitchen', 'Bar']),
            faker.random.arrayElement([3000, 5000, 20000]), 'March 3rd, 2020', 'Fulfilled', null)
        ordersCount += 1
        output.orders.push(order)
    }
    for (let i = 0; i < num; i++) {
        let order = new Order(ordersCount, salesItemDetails2, faker.random.arrayElement(['Kitchen', 'Bar']),
            faker.random.arrayElement([3000, 5000, 20000]), 'March 3rd, 2020', 'Cancelled', 'Customer cancelled order')
        ordersCount += 1
        output.orders.push(order)
    }
}

let bookingsCount = 1

function generateBookingHistory(num) {
    for (let i = 0; i < num; i++) {
        let booking = new Booking(bookingsCount, 'Deluxe room 301', '5th January, 2020',
            '7th January, 2020', 5000, 15000, 'closed')
        output.bookings.push(booking)
        bookingsCount += 1
    }
    for (let i = 0; i < num; i++) {
        let booking = new Booking(bookingsCount, 'Deluxe room 301', '28th March, 2020',
            null,5000, 15000, 'open')
        output.bookings.push(booking)
        bookingsCount += 1
    }
}

let salesCount = 1
function generateCashSales(num){
    for(let i = 0; i < num; i++){
        let sale = new Sale(salesCount, faker.random.arrayElement([bookingDetails, salesItemDetails, salesItemDetails2]),
            70000, 70000, 0, 0, null, 'paid', '5th March, 2020')
        output.sales.push(sale)
        output.cashSales.push(sale)
        salesCount += 1
    }
}

let customerInfo1 = 'Person A, room 301'
let customerInfo2 = 'Person B'
let customerInfo3 = 'Person A again (different spelling)'

function generatePendingCreditSales(num){
    for(let i = 0; i < num; i++){
        let sale = new Sale(salesCount, faker.random.arrayElement([bookingDetails, salesItemDetails2, salesItemDetails]),
            10000, 0, 10000, 0,
            faker.random.arrayElement([customerInfo1, customerInfo2, customerInfo3]), 'pending', '29th March, 2020')
        output.sales.push(sale)
        output.creditSales.push(sale)
        salesCount += 1
    }
}

function generateForgivenCreditSales(num){
    for(let i = 0; i < num; i++){
        let sale = new Sale(salesCount, faker.random.arrayElement([bookingDetails, salesItemDetails, salesItemDetails2]),
            0, 0, 0, 20000,  faker.random.arrayElement([customerInfo1, customerInfo2, customerInfo3]), 'complementary', '20th March, 2020')
        output.sales.push(sale)
        salesCount += 1
    }
    for(let i = 0; i < num; i++){
        let sale = new Sale(salesCount, faker.random.arrayElement([bookingDetails, salesItemDetails, salesItemDetails2]),
            0, 50000, 0, 15000,  faker.random.arrayElement([customerInfo1, customerInfo2, customerInfo3]),  'discounted', '20th March, 2020')
        output.sales.push(sale)
        salesCount += 1
    }
}

generateOrderHistory(15)
generateBookingHistory(20)
generateCashSales(15)
generatePendingCreditSales(15)
generateForgivenCreditSales(15)

let counter = 1
var reservationCount = 1
class Room {
    constructor (id, roomNo, status, price, type, reservation = null, reservations = null) {
        this.id = id
        this.room_no = roomNo
        this.status = status
        this.price = price
        this.type = type
        this.reservation = null
        this.reservations = null
    }

}


function CreateReservation(id, roomId, creationDate, customerName, startDate, endDate, numOfNights, status, reservation = null, reservations = null, booking = null){
    return {
        id:  id,
        roomId: roomId,
        creationDate:  creationDate,
        customerName: customerName,
        startDate: startDate,
        endDate: endDate,
        numOfNights: numOfNights,
        status: status
    }


}


function generateRooms(num, status, type, price, withReservations = false, withBooking = false){
    for(let i = 0; i < num; i++){
        let room = new Room(counter, 100 + counter, status, price, type)
        if(withReservations === true){
            room.reservations = generateReservations(counter)
            room.reservation = generateCurrentReservation(counter)
        }
        if(withBooking === true){
            room.booking = generateBooking(price, counter)
        }
        output.rooms.push(room)
        counter += 1
    }
}


function generateReservations(num, roomId){
    let upcomingReservations = {
        reservations: []
    }
    let currentDate = DateTime.local()
    let factor = 4
    for(let i = 0; i < num; i++){
        let startDate = currentDate.plus({days: factor})
        let endDate =  startDate.plus({days: factor})
        console.log(Interval.fromDateTimes(startDate, endDate).length('days'))
        let reservation = CreateReservation(
            reservationCount, roomId, currentDate, "Random Customer", startDate, endDate,
            Interval.fromDateTimes(startDate, endDate).length('days') < 1 ? 1 : Interval.fromDateTimes(startDate, endDate).length('days'), "pending"
        )
        factor += 2
        upcomingReservations.reservations.push(reservation)
        reservationCount++
    }
    return upcomingReservations
}

function generateCurrentReservation(roomId){
    let currentDate = DateTime.local()
    let startDate = currentDate
    let endDate = startDate.plus({days: 2})
    let reservation = CreateReservation(
        reservationCount, roomId, currentDate, "Random Customer", startDate, endDate,
        Interval.fromDateTimes(endDate, startDate).length('days') < 1 ? 1 : Interval.fromDateTimes(endDate, startDate).length('days'), "pending"
    )
    return reservation
}

function generateBooking(price, roomId = 100){
    return {
        roomId: roomId,
        creationDate: DateTime.local(),
        costPerNight: price,
        AmountPaid: 0,
        Status: 'pending'
    }
}
generateRooms(5, 'reserved', 'deluxe', 6000)
generateRooms(5, 'reserved', 'classic', 6000)
generateRooms(5, 'reserved', 'suite', 6000)
generateRooms(10, 'booked', 'suite', 4000)
generateRooms(10, 'booked', 'classic', 4000)
generateRooms(10, 'booked', 'VIP', 4000)
generateRooms(10, 'available', 'VIP', 10000)
generateRooms(10, 'available', 'deluxe', 6000)
generateRooms(10, 'available', 'classic', 6000)
generateRooms(10, 'available', 'suite', 6000)
generateRooms(30, 'unavailable', 'classic', 6000)

function generateItems(num, name = 'White Rice'){
    let items = []
    for(let i = 0; i < num; i++){
        items.push({
            id: 3,
            department: 'kitchen',
            unit: 'plate(s)',
            pricePerUnit: 4000,
            name: name,
            quantity: 3
        })
    }
    return items
}

function generateOrders(num, status = 'pending', destination = 'Room 305'){
    let orders = []
    for(let i = 0; i < num; i++){
        orders.push({
            id: 4,
            items: generateItems(3),
            amountDue: 15000,
            status: status,
            notes: null,
            destination: destination
        })
    }
    return orders
}

let inventory = {
    items: []
}

let history = {
    entries: []
}

let queries = {
    queries: []
}

class Item{

    constructor(id, name, unit, quantity){
        this.id = id
        this.name = name
        this.quantity = quantity
        this.unit = unit
    }

}

class Entry{
    constructor(id, date, quantity, itemQuantityBalance, supplier, department, itemName, itemUnit){
        this.id = id
        this.date = date
        this.quantity = quantity
        this.itemQuantityBalance = itemQuantityBalance
        this.supplier = supplier
        this.department = department
        this.itemName = itemName
        this.itemUnit = itemUnit
    }
}

class Query{
    constructor(id, expectedQuantity, actualQuantity, date, item){
        this.id = id
        this.expectedQuantity = expectedQuantity
        this.actualQuantity = actualQuantity
        this.item = item
        this.date = date
    }
}

let itemCount = 1
let entryCount = 1
let queryCount = 1

function generateStoreItems(num){
    for(let i = 0; i < num; i++){
        let item = new Item(itemCount, faker.random.arrayElement(['Coca Cola', 'Rice', 'Air Freshner', 'Fanta', 'Malt', 'Plantain']),
            faker.random.arrayElement(['Dozen(s)', 'Gallon(s)', 'Stick(s)', 'Bag(s)', 'Bottle(s)']),
            faker.random.arrayElement([30, 20, 15, 5, 0, 10, 0, 0, 1, 12]))
        inventory.items.push(item)
        itemCount += 1
    }
}

function generateSupplyHistory(num){
    for(let i = 0; i < num; i++){
        let entry = new Entry(entryCount, 'February 3rd, 2020', faker.random.arrayElement([30, 20, 5, 10]),
            faker.random.arrayElement([12, 5, 10, 20]), 'Random Supplier', null,
            faker.random.arrayElement(['Coca Cola', 'Rice', 'Air Freshner', 'Fanta', 'Malt', 'Plantain']),
            faker.random.arrayElement(['Dozen(s)', 'Gallon(s)', 'Stick(s)', 'Bag(s)', 'Bottle(s)']))
        history.entries.push(entry)
        entryCount += 1
    }
}

function generateDisbursementHistory(num){
    for(let i = 0; i < num; i++){
        let entry = new Entry(entryCount, 'February 3rd, 2020', faker.random.arrayElement([30, 20, 5, 10]),
            faker.random.arrayElement([12, 5, 10, 20]), null, faker.random.arrayElement(['kitchen', 'bar', 'reception', 'hotel']),
            faker.random.arrayElement(['Coca Cola', 'Rice', 'Air Freshner', 'Fanta', 'Malt', 'Plantain']),
            faker.random.arrayElement(['Dozen(s)', 'Gallon(s)', 'Stick(s)', 'Bag(s)', 'Bottle(s)']))
        history.entries.push(entry)
        entryCount += 1
    }
}

function generateQuery(num){
    for(let i = 0; i < num; i++){
        let query = new Query(queryCount, faker.random.arrayElement([30, 50, 35]), faker.random.arrayElement([10, 15, 20]), 'March 2nd, 2020', {
            id: 3,
            name: 'Random Item'
        })
        queries.queries.push(query)
        queryCount += 1
    }

}

generateStoreItems(50)
generateDisbursementHistory(25)
generateSupplyHistory(25)
generateQuery(7)

output.inventoryitems = inventory.items
output.entries = history.entries
output.queries = queries.queries

output.users = []
output.roles = []
output.salesItems = []
output.departments = []
output.roomsConfig = []
output.roomTypes = []

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

class RoomConfig {
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
function generateRoomsConfig(num){
    for(let i = 0; i < num; i++){
        let room = new RoomConfig(roomsCount, faker.random.arrayElement([103, 105, 101, 109]), 7, faker.random.boolean)
        output.roomsConfig.push(room)
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
generateRoomsConfig(70)
generateRoomType(6)
generateDepartments(5)

let outputString = JSON.stringify(output, null, 1)
fs.writeFile("test-data.json", outputString, function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }

    console.log("JSON file has been saved.");
})