query properties verb=POST {
  input {
    // Street address of the property
    text street_address filters=trim
  
    // City
    text city filters=trim
  
    // State
    text state filters=trim
  
    // ZIP code
    text zip_code filters=trim
  
    // Country (defaults to USA)
    text country?=USA filters=trim
  
    // Building name (optional)
    text building_name? filters=trim
  
    // Unit number (optional)
    text unit_number? filters=trim
  
    // Latitude coordinate (optional)
    decimal latitude?
  
    // Longitude coordinate (optional)
    decimal longitude?
  
    // Additional notes (optional)
    text notes? filters=trim
  
    // Type of property (optional)
    uuid property_type_id? {
      table = "property_types"
    }
  }

  stack {
    // Check if property already exists at this address
    db.query properties {
      where = $db.properties.street_address == $input.street_address && $db.properties.city == $input.city && $db.properties.state == $input.state && $db.properties.postal_code == $input.zip_code
      return = {type: "single"}
    } as $existing_property
  
    conditional {
      if ($existing_property != null) {
        var $property {
          value = $existing_property
        }
      }
    
      else {
        // Sanitize property_type_id to ensure empty strings become null to prevent UUID syntax errors
        var $clean_property_type_id {
          value = ($input.property_type_id == "" ? null : $input.property_type_id)
        }
      
        db.add properties {
          data = {
            street_address  : $input.street_address
            city            : $input.city
            state           : $input.state
            postal_code     : $input.zip_code
            country         : $input.country
            building_name   : $input.building_name
            unit_number     : $input.unit_number
            latitude        : $input.latitude
            longitude       : $input.longitude
            notes           : $input.notes
            created_at      : now
            updated_at      : now
            property_type_id: $clean_property_type_id
          }
        } as $property
      }
    }
  }

  response = $property
}