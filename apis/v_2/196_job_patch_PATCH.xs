// Update a job's stage or other fields
query "job-patch" verb=PATCH {
  auth = "user"

  input {
    // Job ID to update
    uuid id
  
    // Data to update (e.g., {"stage": stage_id})
    json data
  }

  stack {
    db.patch jobs {
      field_name = "id"
      field_value = $input.id
      data = $input.data
    } as $updated_job
  }

  response = $updated_job
}