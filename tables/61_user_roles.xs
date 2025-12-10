table user_roles {
  auth = false

  schema {
    uuid id
    timestamp created_at?=now
    text name? filters=trim
    text slug? filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}