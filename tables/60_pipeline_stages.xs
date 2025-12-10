table pipeline_stages {
  auth = false

  schema {
    uuid id
    timestamp created_at?=now
    text name? filters=trim
    uuid? role_visibility? {
      table = "user_roles"
    }
  
    int hierarchy?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}