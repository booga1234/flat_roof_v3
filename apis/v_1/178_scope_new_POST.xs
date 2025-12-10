query "scope-new" verb=POST {
  auth = "user"

  input {
    uuid? job_id?
    json data?
  }

  stack {
    db.add scopes {
      data = {
        created_at    : "now"
        title         : $input.data.title
        description   : $input.data.description
        stage         : "incomplete"
        media         : null
        job           : $input.job_id
        time_sensitive: $input.data.time_sensitive
      }
    } as $scopes1
  }

  response = $scopes1
}