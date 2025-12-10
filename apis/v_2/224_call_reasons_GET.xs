// Get all call reasons for dropdown selection
query "call-reasons" verb=GET {
  input {
  }

  stack {
    // Retrieve all call reasons
    db.query lead_reasons {
      return = {type: "list"}
    } as $call_reasons
  }

  response = $call_reasons
}