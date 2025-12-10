// Find a property by address fields and return its ID
function "properties/find_existing" {
  input {
    // The street address to match
    text street_address? filters=trim
  
    // The city to match
    text city? filters=trim
  
    // The state to match
    text state? filters=trim
  
    // The zip code to match
    text zip_code? filters=trim
  
    // The country to match
    text country? filters=trim
  }

  stack {
    // Query for an existing property matching the provided address details
    db.query properties {
      where = $db.properties.street_address == $input.street_address && $db.properties.city == $input.city && $db.properties.state == $input.state && $db.properties.postal_code == $input.zip_code && $db.properties.country == $input.country
      return = {type: "single"}
    } as $existing_property
  }

  response = $existing_property|get:"id"
  history = 100
}