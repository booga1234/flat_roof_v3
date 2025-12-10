query user_locations verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query user_locations {
      where = $db.user_locations.user_id == $auth.id
      return = {type: "list"}
      addon = [
        {
          name : "location"
          input: {locations_id: $output.location_id}
          as   : "location"
        }
      ]
    } as $user_locations1
  }

  response = $user_locations1
}