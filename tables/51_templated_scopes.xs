table templated_scopes {
  auth = false

  schema {
    uuid id
    timestamp created_at?=now
    text title? filters=trim
    text description? filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}