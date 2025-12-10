table properties {
  auth = false

  schema {
    // Unique identifier for the property
    uuid id
  
    text formatted_address? filters=trim
    text street_number? filters=trim
    text route? filters=trim
  
    // City
    text city? filters=trim
  
    text county? filters=trim
  
    // State (e.g., 'CA', 'NY')
    text state? filters=trim
  
    // Country (default: 'USA')
    text country? filters=trim
  
    // ZIP code
    text postal_code? filters=trim
  
    // Building name (e.g., 'Downtown Office Complex')
    text building_name? filters=trim
  
    // Unit number or suite (e.g., 'Suite 200', 'Unit 5')
    text unit_number? filters=trim
  
    // Additional notes about the property
    text notes?
  
    text accessibility_note_details? filters=trim
    int number_of_stories?=1
    uuid? roof_type_id? {
      table = "roof_types"
    }
  
    uuid? property_type_id? {
      table = "property_types"
    }
  
    uuid? roof_acess_type_id? {
      table = "roof_access_types"
    }
  
    uuid? property_access_type_id? {
      table = "property_access_types"
    }
  
    // Latitude coordinate for mapping
    decimal latitude?
  
    // Longitude coordinate for mapping
    decimal longitude?
  
    timestamp? created_at?=now
    timestamp? updated_at?=now
    uuid? property_parking_condition_id? {
      table = "property_parking_conditions"
    }
  
    text google_place_id? filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "city", op: "asc"}]}
    {type: "btree", field: [{name: "state", op: "asc"}]}
  ]
}