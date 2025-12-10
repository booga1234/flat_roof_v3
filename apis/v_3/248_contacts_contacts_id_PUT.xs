// Update contacts record
query "contacts/{contacts_id}" verb=PUT {
  auth = "user"

  input {
    uuid contacts_id?
    dblink {
      table = "contacts"
    }
  }

  stack {
    db.edit contacts {
      field_name = "id"
      field_value = $input.contacts_id
      data = {
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