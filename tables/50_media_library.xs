table media_library {
  auth = false

  schema {
    uuid id
    timestamp created_at?=now
    image? image?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}