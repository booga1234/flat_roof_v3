// Edit locations record
query "locations/{locations_id}" verb=PATCH {
  auth = "user"

  input {
    uuid locations_id?
    dblink {
      table = "locations"
    }
  }

  stack {
    util.get_raw_input {
      encoding = "json"
      exclude_middleware = false
    } as $raw_input
  
    db.patch locations {
      field_name = "id"
      field_value = $input.locations_id
      data = `$input|pick:($raw_input|keys)`|filter_null|filter_empty_text
    } as $model
  }

  response = $model
}