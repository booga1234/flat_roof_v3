table scopes {
  auth = false

  schema {
    uuid id
    timestamp created_at?=now
    text title? filters=trim
    text description? filters=trim
    enum stage? {
      values = ["incomplete", "complete", "approval"]
    }
  
    uuid[]? media? {
      table = "media_library"
    }
  
    uuid? job? {
      table = "jobs"
    }
  
    bool time_sensitive?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}