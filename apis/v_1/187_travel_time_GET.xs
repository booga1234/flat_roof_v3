query "travel-time" verb=GET {
  auth = "user"

  input {
    // ID of the job to get travel time for
    uuid id
  
    // Current latitude of the user
    text lat
  
    // Current longitude of the user
    text lon
  }

  stack {
    db.get jobs {
      field_name = "id"
      field_value = $input.id
    } as $job
  
    db.get "" {
      field_name = "id"
      field_value = $job.location
    } as $location
  
    var $destination_address {
      value = $location.street_address ~ ", " ~ $location.city ~ ", " ~ $location.state ~ " " ~ $location.zip_code
    }
  
    var $origin {
      value = $input.lat ~ "," ~ $input.lon
    }
  
    api.request {
      url = "https://maps.googleapis.com/maps/api/distancematrix/json"
      method = "GET"
      params = {}
        |set:"origins":$origin
        |set:"destinations":$destination_address
        |set:"key":$env.google_maps
    } as $google_maps_response
  
    var $travel_time {
      value = $google_maps_response.response.result.rows[0].elements[0].duration.text
    }
  
    var $travel_distance {
      value = $google_maps_response.response.result.rows[0].elements[0].distance.text
    }
  }

  response = {
    job_id             : $input.id
    destination_address: $destination_address
    origin             : $origin
    travel_time        : $travel_time
    travel_distance    : $travel_distance
  }
}