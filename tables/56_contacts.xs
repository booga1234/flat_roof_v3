table contacts {
  auth = false

  schema {
    uuid id
    timestamp created_at?=now
    text first_name? filters=trim
    text last_name? filters=trim
    text phone? filters=trim
    email email? filters=trim|lower
    text notes? filters=trim
    enum preferred_contact_method?=any {
      values = ["email", "phone", "text", "any"]
    }
  
    uuid? organization_id? {
      table = "organizations"
    }
  
    text title? filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
    {
      name : "contacts_search"
      lang : "english"
      type : "search"
      field: [
        {name: "first_name", op: "A"}
        {name: "last_name", op: "A"}
        {name: "email", op: "B"}
        {name: "phone", op: "C"}
      ]
    }
  ]
}