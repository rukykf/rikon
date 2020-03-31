const fs = require('fs')
const faker = require('faker')

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

function generateItems(num){
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

generateItems(50)
generateDisbursementHistory(25)
generateSupplyHistory(25)
generateQuery(7)

let output = {
    items: inventory.items,
    entries: history.entries,
    queries: queries.queries
}

let outputString = JSON.stringify(output, null, 1)
fs.writeFile("store.json", outputString, function(err){
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
 
    console.log("JSON file has been saved."); 
})