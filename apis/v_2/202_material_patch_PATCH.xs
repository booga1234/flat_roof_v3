// Update a material's fields
query "material-patch" verb=PATCH {
  auth = "user"

  input {
    // Material ID to update
    uuid id
  
    // Data to update (e.g., {"name": "New Name", "category_id": category_uuid})
    json data
  }

  stack {
    db.patch materials {
      field_name = "id"
      field_value = $input.id
      data = $input.data
    } as $updated_material
  }

  response = $updated_material
}