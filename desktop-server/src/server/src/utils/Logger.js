const PerfectLogger = require("perfect-logger")

PerfectLogger.initialize("RikonHMS", {
  logLevelFile: 0,
  logLevelConsole: 8,
  logDirectory: "C:\\rikon\\logs"
})

module.exports = {
  logRequestError(req, error, message = "") {
    PerfectLogger.crit("\n\nError Processing Request")
    PerfectLogger.crit(`Message: ${message}`)
    PerfectLogger.crit(
      "==============================================================================================================="
    )
    PerfectLogger.crit("Request Details Below")
    PerfectLogger.crit("Request Params=============================")
    PerfectLogger.crit(JSON.stringify(req.params))
    PerfectLogger.crit("Request Query Params=========================")
    PerfectLogger.crit(JSON.stringify(req.query))
    PerfectLogger.crit("Request Body Params===========================")
    PerfectLogger.crit(JSON.stringify(req.body))
    PerfectLogger.crit(
      "==============================================================================================================="
    )
    PerfectLogger.crit("Error Details Below")
    PerfectLogger.crit(JSON.stringify(error))
  },

  logCriticalInfo(data) {
    PerfectLogger.crit("Info========================================")
    PerfectLogger.crit(JSON.stringify(data))
  }
}
