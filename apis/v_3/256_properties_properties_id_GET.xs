// Get properties record
query "properties/{properties_id}" verb=GET {
  auth = "user"

  input {
    uuid properties_id?
  }

  stack {
    db.get properties {
      field_name = "id"
      field_value = $input.properties_id
      addon = [
        {
          name : "property_type"
          input: {property_types_id: $output.property_type_id}
          as   : "property_type"
        }
      ]
    } as $model
  
    precondition ($model != null) {
      error_type = "notfound"
      error = "Not Found"
    }
  }

  response = $model
}