query "material-category-patch" verb=PATCH {
  auth = "user"

  input {
    uuid id
    json data
  }

  stack {
    db.patch material_categories {
      field_name = "id"
      field_value = $input.id
      data = merge($input.data, {updated_at: now()})
    } as $updated_category
  }

  response = $updated_category
}