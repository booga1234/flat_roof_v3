// Query all leads records
query leads verb=GET {
  auth = "user"

  input {
  }

  stack {
    function.run user_current_location_id {
      input = {user_id: $auth.id}
    } as $location_id
  
    db.query leads {
      where = $db.leads.is_deleted == false && $db.leads.location_id == $location_id
      return = {type: "list"}
      addon = [
        {
          name : "contact"
          input: {contacts_id: $output.contact_id}
          as   : "contact"
        }
      ]
    } as $model
  }

  response = $model
}