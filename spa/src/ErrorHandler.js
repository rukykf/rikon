import _ from "lodash"

export default function(error) {
  if (_.get(error, ["response", "data", "messages"])) {
    return error.response.data.messages
  } else {
    return ["Network error, contact management to resolve the issue"]
  }
}
