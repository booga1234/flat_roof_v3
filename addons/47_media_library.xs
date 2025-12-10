addon media_library {
  input {
    uuid media_library_id? {
      table = "media_library"
    }
  }

  stack {
    db.query media_library {
      where = $db.media_library.id == $input.media_library_id
      return = {type: "single"}
    }
  }
}