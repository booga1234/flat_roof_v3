table media {
  auth = false

  schema {
    uuid id
    timestamp created_at?=now
    text path? filters=trim
    text filename? filters=trim
    text mime_type? filters=trim
    text extension? filters=trim
    int size_bytes?
    uuid? user_id? {
      table = "user"
    }
  
    // now
    timestamp? updated_at?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}