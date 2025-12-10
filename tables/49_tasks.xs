table tasks {
  auth = false

  schema {
    uuid id
    timestamp created_at?=now
    timestamp? due_date?
    text title? filters=trim
    text description? filters=trim
    uuid[]? media? {
      table = "media_library"
    }
  
    enum stage? {
      values = ["complete", "incomplete"]
    }
  
    uuid? job? {
      table = "jobs"
    }
  
    uuid[]? team? {
      table = "user"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}