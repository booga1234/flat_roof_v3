addon lead {
  input {
    uuid leads_id? {
      table = "leads"
    }
  }

  stack {
    db.query leads {
      where = $db.leads.id == $input.leads_id
      return = {type: "single"}
    }
  }
}