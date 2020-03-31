const fs = require('fs')
const { DateTime, Interval } = require('luxon')


let output = {
    items: generateItems(30).concat(generateItems(30, 'Fried Rice')).concat(generateItems(4, 'Beans')),
    orders: generateOrders(4)
}

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

outputJson = JSON.stringify(output)
fs.writeFile("orders-items.json", outputJson, function(err){
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
 
    console.log("JSON file has been saved."); 
})
