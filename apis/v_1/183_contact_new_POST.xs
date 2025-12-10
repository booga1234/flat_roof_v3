query "contact-new" verb=POST {
  auth = "user"

  input {
    json data?
  }

  stack {
    db.add contacts {
      data = {
        created_at              : "now"
        first_name              : $input.data.first_name
        last_name               : $input.data.last_name
        client                  : $input.data.client
        phone                   : $input.data.phone
        email                   : $input.data.email
        notes                   : $input.data.notes
        preferred_contact_method: $input.data.prefered_contact_method
      }
    } as $created_contact
  
    db.edit jobs {
      field_name = "id"
      field_value = $input.data.job
      data = {contact: $created_contact.id}
    } as $jobs1
  }

  response = $created_contact.id
}