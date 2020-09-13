const Category = require("../../../../data-access/models/Category")
const StoreItem = require("../../../../data-access/models/StoreItem")

let storeItems = []
let categories = []
let output = { storeItems: storeItems, categories: categories }

module.exports = {
  async populateCategoryWithStoreItems() {
    resetData()
    let category = await Category.query().insert({ name: "a category" })
    categories.push(category)

    let storeItem = await StoreItem.query().insert({
      category_id: category.id,
      name: "first store item"
    })
    storeItems.push(storeItem)

    storeItem = await StoreItem.query().insert({
      category_id: category.id,
      name: "second store item"
    })
    storeItems.push(storeItem)

    return output
  },

  async populateActiveAndInactiveCategory() {
    resetData()
    let activeCategory = await Category.query().insert({
      name: "an active category"
    })

    let inactiveCategory = await Category.query().insert({
      name: "an inactive category",
      active: 0
    })

    categories.push(activeCategory)
    categories.push(inactiveCategory)

    return output
  }
}

function resetData() {
  categories = []
  storeItems = []
  output = { storeItems: storeItems, categories: categories }
}
