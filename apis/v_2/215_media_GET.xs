query media verb=GET {
  auth = "user"

  input {
    text? media_type
    text? related_table
    uuid? related_id
  }

  stack {
    db.query "" {
      sort = {media.created_at: "desc"}
      return = {type: "list"}
      output = [
        "id"
        "file_url"
        "media_type"
        "related_table"
        "related_id"
        "caption"
        "uploaded_by_id"
        "created_at"
        "updated_at"
      ]
    } as $media
  }

  response = {media: $media}
}