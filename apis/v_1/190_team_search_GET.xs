// Searches for team members with optional filters for search term and role.
query "team/search" verb=GET {
  auth = "user"

  input {
    // Search term to match against first and last names.
    text search_term? filters=trim
  
    // Optional role ID to filter team members. If an invalid UUID is provided, it will be ignored.
    text role_id?
  }

  stack {
    // Initialize a variable to hold a valid role_id UUID.
    var $valid_role_id {
      value = null
    }
  
    // Check if the provided role_id is a valid UUID format.
    conditional {
      if (($input.role_id|strlen) > 0 && ("/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/"|regex_matches:$input.role_id)) {
        // If it's a valid UUID, use it for filtering.
        var.update $valid_role_id {
          value = $input.role_id
        }
      }
    }
  
    // Query team members based on search term and the validated role ID.
    db.query user {
      where = ($db.team.first_name includes? $input.search_term || $db.team.last_name includes? $input.search_term) && $db.user.role ==? $valid_role_id
      return = {type: "list"}
    } as $team_members
  }

  response = $team_members
}