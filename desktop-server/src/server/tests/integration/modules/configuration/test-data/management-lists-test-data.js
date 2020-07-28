const ManagementList = require("../../../../../src/data-access/models/ManagementList")

let managementListItems = []

module.exports = {
  async populateManagementListData() {
    resetData()
    let num = 4
    for (let i = 0; i < num; i++) {
      await populateManagementListItemForList("authorized_to_authorize", `Person ${i}authorize`)
    }

    for (let i = 0; i < num; i++) {
      await populateManagementListItemForList("authorized_for_discounts", `Person ${i}discount`)
    }

    for (let i = 0; i < num; i++) {
      await populateManagementListItemForList("authorized_for_complementary", `Person ${i}complementary`)
    }

    for (let i = 0; i < num; i++) {
      await populateManagementListItemForList("authorized_company", `Person ${i}company`)
    }

    return managementListItems
  },

  async populateManagementListItemData(listName = "authorized_to_authorize", personName = "Some Name") {
    resetData()
    let managementListItem = await populateManagementListItemForList(listName, personName)
    return managementListItem
  },

  async deleteAllDataFromDB() {
    await ManagementList.query().delete()
  }
}

function resetData() {
  managementListItems = []
}

async function populateManagementListItemForList(listName = "authorized_to_authorize", personName = "Person Someone") {
  let managementListItem = await ManagementList.query().insert({
    full_name: personName,
    list_name: listName
  })
  managementListItems.push(managementListItem)
  return managementListItem
}
