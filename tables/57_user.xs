table user {
  auth = true

  schema {
    uuid id
    timestamp created_at?=now
    text first_name? filters=trim
    text last_name? filters=trim
    email email? filters=trim|lower
    text phone? filters=trim
    password password? {
      sensitive = true
    }
  
    image? profile_photo?
    bool is_active?
    uuid? role? {
      table = "user_roles"
    }
  
    uuid? current_location_id? {
      table = "locations"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}