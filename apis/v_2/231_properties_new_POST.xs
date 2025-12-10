query "properties-new" verb=POST {
  auth = "user"

  input {
    text address?
    text street_address?
    text full_address?
    text formatted_address?
    text city?
    text state?
    text zip_code?
    text country?
    uuid property_type_id?
  }

  stack {
    db.add properties {
      data = {
        address          : $input.address
        street_address   : $input.street_address
        full_address     : ($input.full_address != null) ? $input.full_address : (($input.formatted_address != null) ? $input.formatted_address : $input.address)
        formatted_address: ($input.formatted_address != null) ? $input.formatted_address : (($input.full_address != null) ? $input.full_address : $input.address)
        city             : $input.city
        state            : $input.state
        postal_code      : $input.zip_code
        country          : ($input.country != null) ? $input.country : "USA"
        property_type_id : $input.property_type_id
        created_at       : "now"
        updated_at       : "now"
      }
    } as $new_property
  }

  response = $new_property
}