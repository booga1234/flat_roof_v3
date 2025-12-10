addon stage_of_job {
  input {
    uuid pipeline_stages_id? {
      table = "pipeline_stages"
    }
  }

  stack {
    db.query pipeline_stages {
      where = $db.pipeline_stages.id == $input.pipeline_stages_id
      sort = {pipeline_stages.hierarchy: "asc"}
      return = {type: "single"}
    }
  }
}