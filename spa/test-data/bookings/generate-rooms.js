const fs = require('fs')
const { DateTime, Interval } = require('luxon')

let counter = 1
var reservationCount = 1
let rooms = {
    rooms: [],
    booking: generateBooking(5000),
    reservations: generateReservations(3, 100),
    reservation: generateCurrentReservation(100)
}

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
        rooms.rooms.push(room)
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

let roomsArr = JSON.stringify(rooms, null, 1)
fs.writeFile("rooms.json", roomsArr, function(err){
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
 
    console.log("JSON file has been saved."); 
})
