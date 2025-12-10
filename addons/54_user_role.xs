addon user_role {
  input {
    uuid user_roles_id? {
      table = "user_roles"
    }
  }

  stack {
    db.query user_roles {
      where = $db.user_roles.id == $input.user_roles_id
      return = {type: "single"}
    }
  }
}