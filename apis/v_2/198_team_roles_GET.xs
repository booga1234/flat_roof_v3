// Get all available team roles
query "team-roles" verb=GET {
  auth = "user"

  input {
  }

  stack {
    // Get all team roles
    db.query user_roles {
      sort = {team_roles.name: "asc"}
      return = {type: "list"}
      output = ["id", "name"]
    } as $roles
  }

  response = $roles
}