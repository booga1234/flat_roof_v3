// Get jobs and pipeline stages visible to the current user
query "jobs-pipeline" verb=GET {
  auth = "user"

  input {
  }

  stack {
    // Get current logged-in team member
    db.get user {
      field_name = "id"
      field_value = $auth.id
    } as $team
  
    // Get pipeline stages visible to this user's role
    db.query pipeline_stages {
      where = $db.pipeline_stages.role_visibility == $team.role
      return = {type: "list"}
      output = ["id", "name", "order"]
    } as $visible_stages
  
    // Get all jobs with their related data
    db.query jobs {
      return = {type: "list"}
      output = ["id", "location", "stage", "client", "contact"]
      addon = [
        {
          name : "location_of_job"
          input: {location_id: $output.location}
          as   : "location"
        }
        {
          name : "stage_of_job"
          input: {pipeline_stages_id: $output.stage}
          as   : "stage"
        }
        {
          name : "contact"
          input: {contacts_id: $output.contact}
          as   : "contact"
        }
        {
          name : "client"
          input: {client_id: $output.client}
          as   : "client"
        }
      ]
    } as $all_jobs
  }

  response = {jobs: $all_jobs, stages: $visible_stages}
}