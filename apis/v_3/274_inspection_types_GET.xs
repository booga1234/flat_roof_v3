// Query all inspection_types records
query inspection_types verb=GET {
  input {
  }

  stack {
    db.query inspection_types {
      return = {type: "list"}
    } as $model
  }

  response = $model
}