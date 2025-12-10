query "media-upload" verb=POST {
  auth = "user"

  input {
    json data?
    uuid? scope_id?
  }

  stack {
  }

  response = null
}