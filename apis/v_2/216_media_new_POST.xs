query "media-new" verb=POST {
  auth = "user"

  input {
    text file_url
    text media_type
    text related_table
    uuid related_id
    text? caption
    uuid? uploaded_by_id
  }

  stack {
    db.add "" {
      data = {
        file_url      : $input.file_url
        media_type    : $input.media_type
        related_table : $input.related_table
        related_id    : $input.related_id
        caption       : $input.caption
        uploaded_by_id: $input.uploaded_by_id
        created_at    : now()
        updated_at    : now()
      }
    } as $new_media
  }

  response = $new_media
}