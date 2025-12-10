// Get the record belonging to the authentication token
query "auth/me" verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.get user {
      field_name = "id"
      field_value = $auth.id
      output = [
        "id"
        "created_at"
        "first_name"
        "last_name"
        "email"
        "role"
        "is_active"
        "current_location_id"
        "profile_photo.access"
        "profile_photo.path"
        "profile_photo.name"
        "profile_photo.type"
        "profile_photo.size"
        "profile_photo.mime"
        "profile_photo.meta"
        "profile_photo.url"
      ]
    } as $user
  
    // Get role name from team_roles table if role exists
    conditional {
      if ($user.role != null) {
        db.get user_roles {
          field_name = "id"
          field_value = $user.role
          output = ["id", "name"]
        } as $roleData
      
        var.update $user {
          value = $user|set:"role_name":$roleData.name
        }
      }
    }
  }

  response = $user
}