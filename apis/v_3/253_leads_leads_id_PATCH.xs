// Edit leads record
query "leads/{leads_id}" verb=PATCH {
  auth = "user"

  input {
    uuid leads_id?
    dblink {
      table = "leads"
    }
  }

  stack {
    util.get_raw_input {
      encoding = "json"
      exclude_middleware = false
    } as $raw_input
  
    db.patch leads {
      field_name = "id"
      field_value = $input.leads_id
      data = `$input|pick:($raw_input|keys)`|filter_null|filter_empty_text
    } as $model
  
    db.edit leads {
      field_name = "id"
      field_value = $input.leads_id
      data = {updated_at: now, updated_by_user_id: $auth.id}
    } as $leads1
  }

  response = $model
}