query location_users verb=GET {
  auth = "user"

  input {
    text location_id? filters=trim
  }

  stack {
    // comment
  
    db.query user_locations {
      where = $db.user_locations.location_id == $input.location_id
      return = {type: "list"}
      addon = [
        {
          name : "user"
          input: {user_id: $output.user_id}
          addon: [
            {
              name : "user_role"
              input: {user_roles_id: $output.role}
              as   : "user_role"
            }
          ]
          as   : "user"
        }
      ]
    } as $user_locations1
  }

  response = $user_locations1
}