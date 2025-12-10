// Searches for locations based on a query string, matching against address, city, or zip code.
query "locations/search" verb=GET {
  auth = "user"

  input {
    // The search term to match against location fields.
    // The search term to match against location fields.
    text search_query? filters=trim
  }

  stack {
    // Query the location table for matching records.
    // Filter locations by street address, city, or zip code using the search query.
    db.query "" {
      where = $db.location.street_address includes? $input.search_query || $db.location.city includes? $input.search_query || $db.location.zip_code includes? $input.search_query
      return = {type: "list"}
    } as $locations
  }

  response = $locations
}