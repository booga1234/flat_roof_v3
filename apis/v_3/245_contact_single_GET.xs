query "contact-single" verb=GET {
  auth = "user"

  input {
    uuid? id?
  }

  stack {
    db.get contacts {
      field_name = "id"
      field_value = $input.id
      addon = [
        {
          name : "organization"
          input: {organizations_id: $output.organization_id}
          as   : "organization"
        }
      ]
    } as $contacts1
  }

  response = $contacts1
}