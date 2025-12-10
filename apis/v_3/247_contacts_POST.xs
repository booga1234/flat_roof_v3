// Add contacts record
query contacts verb=POST {
  auth = "user"

  input {
    dblink {
      table = "contacts"
    }
  }

  stack {
    db.add contacts {
      data = {
        created_at              : "now"
        first_name              : $input.first_name
        last_name               : $input.last_name
        phone                   : $input.phone
        email                   : $input.email
        notes                   : $input.notes
        preferred_contact_method: $input.preferred_contact_method
        organization_id         : $input.organization_id
        title                   : $input.title
      }
    } as $model
  }

  response = $model
}