addon client {
  input {
    uuid client_id? {
      table = "client"
    }
  }

  stack {
    db.query client {
      where = $db.client.id == $input.client_id
      return = {type: "single"}
    }
  }
}