const fs = require('fs')
const faker = require('faker')

let output = {
    sales: [],
    creditSales: [],
    pendingCreditSales: [],
    cashSales: [],
    orders: [],
    bookings: []
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

let outputString = JSON.stringify(output, null, 1)
fs.writeFile("reports.json", outputString, function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }

    console.log("JSON file has been saved.");
})