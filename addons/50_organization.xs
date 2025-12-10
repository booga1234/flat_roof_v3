addon organization {
  input {
    uuid organizations_id? {
      table = "organizations"
    }
  }

  stack {
    db.query organizations {
      where = $db.organizations.id == $input.organizations_id
      return = {type: "single"}
    }
  }
}