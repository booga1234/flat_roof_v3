table organizations {
  auth = false

  schema {
    uuid id
    timestamp created_at?=now
    timestamp? last_updated?=now
    text name? filters=trim
    text website? filters=trim
    text billing_address_line1? filters=trim
    text billing_address_line2? filters=trim
    text billing_city? filters=trim
    text billing_state? filters=trim
    text billing_zip? filters=trim
    text billing_country? filters=trim
    uuid? primary_contact_id? {
      table = "contacts"
    }
  
    text billing_email? filters=trim
    bool is_active?=true
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}