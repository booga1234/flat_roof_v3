table user_locations {
  auth = false

  schema {
    uuid id
    timestamp created_at?=now
    uuid? user_id? {
      table = "user"
    }
  
    uuid? location_id? {
      table = "locations"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}