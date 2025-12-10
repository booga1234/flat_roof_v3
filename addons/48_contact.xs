addon contact {
  input {
    uuid contacts_id? {
      table = "contacts"
    }
  }

  stack {
    db.query contacts {
      where = $db.contacts.id == $input.contacts_id
      return = {type: "single"}
    }
  }
}