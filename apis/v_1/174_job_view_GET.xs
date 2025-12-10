query "job-view" verb=GET {
  auth = "user"

  input {
    uuid? id?
  }

  stack {
    db.get jobs {
      field_name = "id"
      field_value = $input.id
    } as $job
  
    db.query scopes {
      where = $db.scopes.job == $input.id
      return = {type: "list"}
      addon = [
        {
          name : "media_library"
          input: {media_library_id: $output.$this}
          as   : "media"
        }
      ]
    } as $scopes
  }

  response = {job_info: $job, scopes: $scopes}
}