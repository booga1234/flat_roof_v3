table jobs {
  auth = false

  schema {
    uuid id
    timestamp created_at?=now
    uuid[]? media? {
      table = "media_library"
    }
  
    uuid? location? {
      table = ""
    }
  
    uuid? stage? {
      table = "pipeline_stages"
    }
  
    uuid? client? {
      table = "client"
    }
  
    uuid? contact? {
      table = "contacts"
    }
  
    uuid[]? team? {
      table = "user"
    }
  
    int target_price?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}