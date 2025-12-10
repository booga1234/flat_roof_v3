table common_issues {
  auth = false

  schema {
    uuid id
    timestamp created_at?=now
    timestamp updated_at?=now
    text name? filters=trim
    text slug? filters=trim
    text description? filters=trim
    enum severity_level? {
      values = ["minor", "moderate", "severe"]
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}