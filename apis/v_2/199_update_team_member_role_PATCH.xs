// Update a team member's role
query "update-team-member-role" verb=PATCH {
  auth = "user"

  input {
    // ID of the team member to update (UUID from team table)
    text team_member_id
  
    // ID of the new role to assign (UUID string from team_roles table)
    text role_id
  }

  stack {
    // Update the team member's role
    db.patch user {
      field_name = "id"
      field_value = $input.team_member_id
      data = {role: $input.role_id}
    } as $updated_member
  }

  response = $updated_member
}