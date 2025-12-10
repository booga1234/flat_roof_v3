// Edit properties record
query "properties/{properties_id}" verb=PATCH {
  auth = "user"

  input {
    uuid properties_id?
    dblink {
      table = "properties"
    }
  }

  stack {
    util.get_raw_input {
      encoding = "json"
      exclude_middleware = false
    } as $raw_input
  
    db.patch properties {
      field_name = "id"
      field_value = $input.properties_id
      data = $input|pick:($raw_input|keys)
    } as $model
  }

  response = $model
}