// Searches for contacts by first name or last name using a fuzzy search term.
query search_contacts verb=GET {
  auth = "user"

  input {
    // Optional search term to filter contacts by first name or last name.
    text search_term? filters=trim
  }

  stack {
    // Query the 'contacts' table, applying fuzzy search logic to the first_name and last_name fields.
    db.query contacts {
      where = ($db.contacts.first_name includes? $input.search_term) || ($db.contacts.last_name includes? $input.search_term)
      return = {type: "list"}
    } as $filtered_contacts
  }

  response = $filtered_contacts
}