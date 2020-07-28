module.exports = function(error) {
  let errorMessages = []
  let modelErrors = Object.keys(error.data)

  modelErrors.forEach((modelError) => {
    error.data[modelError].forEach((e) => {
      errorMessages.push(`${modelError}: ${e.message} `)
    })
  })
  return errorMessages
}
