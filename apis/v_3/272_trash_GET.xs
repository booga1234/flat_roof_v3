query trash verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query leads {
      where = `$db.leads.is_deleted`
      return = {type: "list"}
      addon = [
        {
          name : "user"
          input: {user_id: $output.updated_by_user_id}
          as   : "updated_by_user"
        }
        {
          name : "contact"
          input: {contacts_id: $output.contact_id}
          as   : "contact"
        }
      ]
    } as $leads
  }

  response = $leads
}