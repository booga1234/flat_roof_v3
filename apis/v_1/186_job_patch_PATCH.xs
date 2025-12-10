query "job-patch" verb=PATCH {
  auth = "user"

  input {
    json data?
    uuid? id?
  }

  stack {
    db.patch jobs {
      field_name = "id"
      field_value = $input.id
      data = $input.data
    } as $jobs1
  }

  response = $jobs1
}