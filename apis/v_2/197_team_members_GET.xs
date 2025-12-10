// Get all team members with their roles and profile information
query "team-members" verb=GET {
  auth = "user"

  input {
  }

  stack {
    // Get all team members with profile photo URL
    db.query user {
      sort = {team.first_name: "asc"}
      return = {type: "list"}
      output = [
        "id"
        "first_name"
        "last_name"
        "email"
        "role"
        "profile_photo.url"
        "profile_photo.path"
        "is_active"
      ]
    } as $team_members
  }

  response = $team_members
}