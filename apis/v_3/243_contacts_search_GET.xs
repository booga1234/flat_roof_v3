query "contacts-search" verb=GET {
  auth = "user"

  input {
    text search_query? filters=trim
  }

  stack {
    db.query contacts {
      where = $db.contacts.$contacts_search search $input.search_query
      sort = {rank: "desc"}
      eval = {
        rank: $db.contacts.$contacts_search|search_rank:$input.search_query
      }
    
      return = {type: "list", paging: {page: 1, per_page: 25}}
    } as $search_results
  }

  response = $search_results
}