query "contact-delete" verb=DELETE {
  auth = "user"

  input {
    uuid? id?
  }

  stack {
    db.del contacts {
      field_name = "id"
      field_value = $input.id
    }
  
    db.query jobs {
      where = $db.jobs.contact == $input.id
      return = {type: "list"}
    } as $job_with_contact
  
    foreach ($job_with_contact) {
      each as $item {
        db.edit jobs {
          field_name = "id"
          field_value = $item.id
          data = {contact: null}
        } as $jobs1
      }
    }
  }

  response = $contacts1
}