query "material-pricing-patch" verb=PATCH {
  auth = "user"

  input {
    uuid id
    json data
  }

  stack {
    db.patch material_pricing {
      field_name = "id"
      field_value = $input.id
      data = merge($input.data, {updated_at: now()})
    } as $updated_pricing
  }

  response = $updated_pricing
}