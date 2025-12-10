query user_inspectors verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query user {
      where = $db.user.role == "bb962b1a-0ee6-4962-a951-291dfe66a994"
      return = {type: "list"}
    } as $user1
  }

  response = $user1
}