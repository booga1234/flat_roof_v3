// Adds property record
query property verb=POST {
  auth = "user"

  input {
    text google_place_id? filters=trim
  }

  stack {
    db.get properties {
      field_name = "google_place_id"
      field_value = $input.google_place_id
    } as $property_record
  
    conditional {
      if ($property_record == null) {
        api.request {
          url = "https://maps.googleapis.com/maps/api/place/details/json"
          method = "GET"
          params = {}
            |set:"place_id":$input.google_place_id
            |set:"key":$env.google_maps
          headers = []|push:"Accept: application/json"
        } as $google_place_data
      
        !debug.stop {
          value = $google_place_data
        }
      
        db.add properties {
          data = {
            formatted_address: $google_place_data.response.result.result.formatted_address
            street_number    : $google_place_data.response.result.result.address_components.0.long_name
            route            : $google_place_data.response.result.result.address_components.1.short_name
            city             : $google_place_data.response.result.result.address_components.2.long_name
            county           : $google_place_data.response.result.result.address_components.3.long_name
            state            : $google_place_data.response.result.result.address_components.4.short_name
            country          : $google_place_data.response.result.result.address_components.5.short_name
            postal_code      : $google_place_data.response.result.result.address_components.6.short_name
            latitude         : $google_place_data.response.result.result.geometry.location.lat
            longitude        : $google_place_data.response.result.result.geometry.location.lng
            created_at       : now
            updated_at       : now
            google_place_id  : $input.google_place_id
          }
        } as $property_record
      }
    }
  }

  response = $property_record
}