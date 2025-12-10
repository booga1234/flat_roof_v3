query "contacts-list" verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query contacts {
      sort = {contacts.created_at: "desc"}
      return = {type: "list", paging: {page: 1, per_page: 25}}
      addon = [
        {
          name : "organization"
          input: {organizations_id: $output.organization_id}
          as   : "items.organization"
        }
      ]
    } as $contacts1
  }

  response = $contacts1
}