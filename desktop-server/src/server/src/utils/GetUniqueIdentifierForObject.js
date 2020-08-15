const { DateTime } = require("luxon")

module.exports = function getUniqueIdentifierForObject(identifierPrefix, objectId, creationDate) {
  // Assumption here is that there can't be more than 10,000,000 items generated in a single year
  // and the year will be part of the unique id that's generated

  while (objectId > 10000000) {
    objectId -= 10000000
  }

  let batchNo = Math.floor(objectId / 10000) + 1
  let recordId = objectId % 10000
  let { year } = DateTime.fromISO(creationDate)

  let uniqueId = `${identifierPrefix.toUpperCase()}/${year}/B${getBatchNoDisplayString(
    batchNo
  )}/N${getRecordIdDisplayString(recordId)}`

  return uniqueId
}

function getBatchNoDisplayString(batchNo) {
  if (batchNo < 9) {
    return `000${batchNo}`
  }

  if (batchNo < 100) {
    return `00${batchNo}`
  }

  if (batchNo < 1000) {
    return `0${batchNo}`
  }

  return batchNo
}

function getRecordIdDisplayString(recordId) {
  if (recordId < 9) {
    return `0000${recordId}`
  }

  if (recordId < 100) {
    return `000${recordId}`
  }

  if (recordId < 1000) {
    return `00${recordId}`
  }

  if (recordId < 10000) {
    return `0${recordId}`
  }

  return recordId
}
