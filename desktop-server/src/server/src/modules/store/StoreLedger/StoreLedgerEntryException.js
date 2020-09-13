class StoreLedgerEntryException extends Error {
  constructor(messages = ["something went wrong while trying to create a store ledger entry"]) {
    super("something went wrong with the store ledger")
    this.messages = []
    this.messages.push(...messages)
  }
}

module.exports = StoreLedgerEntryException
